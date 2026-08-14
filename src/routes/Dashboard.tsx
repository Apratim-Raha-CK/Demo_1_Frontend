import { useEffect, useState } from "react"
import FileTable from "../components/FileTable"
import FileUpload from "../components/FileUpload"

export interface FileInterface {
    id?: string,
    file_name: string,
    file_type: string,
    file_size: number,
    created_at: string,
    created_by: "string"
}

export default function Dashboard() {

    const [fileData, setFileData] = useState<FileInterface[]>([])
    const [errorMsg, setErrorMsg] = useState<string>("")
    const [showModal,setShowModal]=useState<boolean>(false)

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? ""
    const fetchFiles = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/files`,{
                credentials:'include',
            })
            if (!response.ok) {
                throw new Error('Failed to fetch data')
            }

            const data = await response.json()
            if (!data || !data?.data?.files) {
                setErrorMsg('Failed to fetch data')
                return;
            }
            setFileData([...data.data.files])



        } catch (error: any) {
            setErrorMsg(error.message)

        }
    }

    useEffect(() => {
        fetchFiles()
    }, [])
    return (
        <>
            <div className="h-screen w-screen">
                <h1 className="text-2xl text-zinc-700 pl-3 pt-4">Dashboard</h1>
                <div className="flex flex-row-reverse px-3">
                    <button onClick={()=>setShowModal(true)} className="py-2 px-4 rounded-2xl bg-blue-400 text-white cursor-pointer">Add file</button>
                </div>
                {errorMsg ? <p className="text-red-400">{errorMsg}</p> : <FileTable fileData={fileData}/>}
                {showModal && <FileUpload open={showModal} setOpen={setShowModal} fetchFiles={fetchFiles}/>}
                

            </div>
        </>
    )
}