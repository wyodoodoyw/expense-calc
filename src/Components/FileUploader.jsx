import { useState } from 'react';

const FileUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      console.log('Uploading file...');

      const formData = new FormData();
      formData.append('file', file);

      // try {
      //   // You can write the URL of your server or any other endpoint used for file upload
      //   // const result = await fetch('https://httpbin.org/post', {
      //   //   method: 'POST',
      //   //   body: formData,
      //   });

      //   const data = await result.json();

      //   console.log(data);
      // } catch (error) {
      //   console.error(error);
      // }
    }
  };

  return (
    <>
      <div className="input-group">
        <input id="file" type="file" onChange={handleFileChange} />
      </div>
      {file && (
        <section>
          File details:
          <ul>
            <li>Name: {file.name}</li>
            <li>Type: {file.type}</li>
            <li>Size: {file.size} bytes</li>
          </ul>
        </section>
      )}

      {file && (
        <button onClick={handleUpload} className="submit">
          Upload Expense File
        </button>
      )}
    </>
  );
};

export default FileUploader;
