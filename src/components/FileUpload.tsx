import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";


interface FileUploadProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    fetchFiles: ()=>void,
}

export default function FileUpload({ open, setOpen,fetchFiles }: FileUploadProps) {
    const [uploadedFile, setUploadedFile] = useState<any>()
    const [errorMsg,setErrorMsg] = useState<string>("")
    const [successMsg,setSuccessMsg]= useState<string>("")
    const [isUploading,setIsUploading] = useState<boolean>(false)
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? ""
    const handleFileChange = (e: any) => {
        if (e.target.files.length > 0) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const handleFileUpload= async()=>{
        if(! uploadedFile){
            setErrorMsg('Upload a file! ')
            return;
        }

        setIsUploading(true)

        const formData= new FormData()

        formData.append('uploaded_file',uploadedFile)
        
        try {
            const response = await fetch(`${BACKEND_URL}/upload-file`,{
                method:'POST',
                body:formData,
                credentials:'include'
            })

            if(! response.ok){
                setErrorMsg('Error occured in uploading file')
                setIsUploading(false)
                return
            }

            const data = await response.json()
            if(! data || data?.status != 'success'){
                 setErrorMsg('Error occured in uploading file')
                setIsUploading(false)
                return;

            }

            setSuccessMsg(data?.message || "Successfully fetched")
            
        } catch (error) {
            console.log(error)
            setErrorMsg("Error occured")
            
        }
        finally{
            setTimeout(()=>{
                setUploadedFile(null)
                setErrorMsg("")
                setOpen(false)
                setSuccessMsg("")
                setIsUploading(false)
                fetchFiles()
            },1000)
        }

    }
    
    return (
        <>
            <Dialog open={open} onClose={setOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                            Upload file
                                        </DialogTitle>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Upload your file here (only csv and xlsx file formats are allowed)
                                            </p>
                                        </div>
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100/80 transition group">
                                            <input type="file" onChange={handleFileChange} className="hidden" />
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                                <span className="text-2xl mb-1 text-gray-400 group-hover:text-gray-500">📁</span>
                                                <p className="text-sm font-medium text-gray-600 truncate max-w-xs">
                                                    {uploadedFile ? uploadedFile.name : "Click to browse local files"}
                                                </p>
                                                {!uploadedFile && <p className="text-xs text-gray-400 mt-1">Supports any binary format</p>}
                                            </div>
                                        </label>
                                    </div>
                                    
                                </div>
                                {errorMsg && <p className="text-red-500">{errorMsg}</p>}
                                {successMsg && <p className="text-green-400">{successMsg}</p>}
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={handleFileUpload}
                                    className="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-600 sm:ml-3 sm:w-auto"
                                >
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    data-autofocus
                                    disabled={isUploading}
                                    onClick={() => setOpen(false)}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}