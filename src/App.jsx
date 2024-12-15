import { DataDisplay } from "./components/DataDisplay/DataDisplay";
import { StringInput } from "./components/StringInput/StringInput";
import { useEffect, useState } from "react";
import forge from "node-forge";
import "./App.css";


function extractKeyString(keyBlock) {
  return keyBlock.replace(/-----BEGIN (PUBLIC|RSA PRIVATE) KEY-----|-----END (PUBLIC|RSA PRIVATE) KEY-----|[\r\n]+/g, '');
}

function App() {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [e, ] = useState(0x10001);
  const [plaintext, setPlaintext] = useState("Hello");
  const [cipherText, setCipherText] = useState("");
  const [cipherTextHex, setCipherTextHex] = useState("");
  const [recovered, setRecovered] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Генерация пары ключей RSA
  function generateKeyPair(eValue) {
    const keypair = forge.pki.rsa.generateKeyPair({ bits: 1024, e: eValue });
    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

    const keyPairJson = JSON.stringify({
      publicKey: publicKeyPem,
      privateKey: privateKeyPem
    }, null, 2);
  
    const blob = new Blob([keyPairJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keypair.json';
    a.click();
    URL.revokeObjectURL(url);

    return { publicKeyPem, privateKeyPem };
  }

  // Шифрование текста
  function encryptText(publicKeyPem, plaintext) {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encrypted = publicKey.encrypt(plaintext, "RSA-OAEP"); // Используется RSA-OAEP
    // return forge.util.encode64(encrypted); // Кодирование в Base64
    setPublicKey("");
    setPrivateKey("");

    return encrypted;
  }

  // Расшифровка текста
  function decryptText(privateKeyPem, encryptedText) {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.decode64(encryptedText); // Декодирование из Base64
    const decrypted = privateKey.decrypt(encryptedBytes, "RSA-OAEP");
    return decrypted;
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUploadComplete = () => {
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = JSON.parse(e.target.result);
      setPublicKey(contents.publicKey);
      setPrivateKey(contents.privateKey);
    };
    reader.readAsText(selectedFile);
  };

  useEffect(() => {
    // const { publicKeyPem, privateKeyPem } = generateKeyPair(e);
    
    // setPublicKey(publicKeyPem);
    // setPrivateKey(privateKeyPem);

  }, []);

  const handleGenerateKeys = () => {
    const { publicKeyPem, privateKeyPem } = generateKeyPair(e);
    setPublicKey(publicKeyPem);
    setPrivateKey(privateKeyPem);
  };

  const handleEncrypt = () => {
    setRecovered("");
    if (plaintext === "") {
      return;
    }
    const encrypted = encryptText(publicKey, plaintext);
    setCipherText(forge.util.encode64(encrypted));
    setCipherTextHex(forge.util.bytesToHex(encrypted));
  };

  const handleDecrypt = () => {

    const decrypted = decryptText(privateKey, cipherText);
    setRecovered(decrypted);
  };

  return (
    <>
      <div className="vertical-container" style={{ width: "800px" }}>
        <div className="button-box">
          <button onClick={handleGenerateKeys}>New RSA Parameters</button>
        </div>

        <fieldset>
          <legend>RSA Parameters</legend>
          <DataDisplay data={extractKeyString(publicKey)} legend="Public Key"/>
          <DataDisplay data={extractKeyString(privateKey)} legend="Private Key"/>
          <DataDisplay data={e.toString(2)} legend="E" />
        </fieldset>

        <StringInput
          legend="Plaintext"
          data={plaintext}
          onChange={setPlaintext}
        />

        <div className="button-box">
          <button onClick={handleEncrypt}>Encrypt</button>
        </div>

        <DataDisplay
          data={cipherText}
          legend="Cyphertext Displayed as Text String"
        />

        <DataDisplay
          data={cipherTextHex}
          legend="Cyphertext Displayed as Byte Array"
          isHex
        />

        <div className="button-box">
        <input type="file" id="key-file" accept=".json" onChange={handleFileUpload} />
        <button onClick={handleFileUploadComplete}>Upload Keys</button>
          <button disabled={cipherText === ""} onClick={handleDecrypt}>
            Decrypt
          </button>
          
        </div>

        <DataDisplay data={recovered} legend="Recovered Plaintext" />
      </div>
    </>
  );
}

export default App;
