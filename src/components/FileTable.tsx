import type { FileInterface } from "../routes/Dashboard";

export default function FileTable({fileData}:{fileData:FileInterface[]}){
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>File Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>File Type</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>File Size</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Created By</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Created At</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fileData.map((file,index) => (
            <tr key={`${file.file_name}-${file.created_at}`} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{index+1}</td>
              <td style={{ padding: '10px' }}>{file?.file_name}</td>
              <td style={{ padding: '10px' }}>{file?.file_type}</td>
              <td style={{ padding: '10px' }}>{file?.file_size}</td>
              <td style={{ padding: '10px' }}>{file?.created_by}</td>
              <td  style={{ padding: '10px' }}><span>{new Date(file.created_at).toLocaleDateString('en-IN')}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
}