import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

import 'dotenv/config';

const app = express();

app.use(cors({
  origin: '*'
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.DESTINATION_PATH ? process.env.DESTINATION_PATH : 'up/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);       // pega a extensão original
    const name = path.basename(file.originalname, ext); // pega o nome sem extensão
    // Monta nome com timestamp para evitar conflito
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

// Configuração do multer para salvar arquivos na pasta 'uploads'
const upload = multer({ storage });

// Rota para upload de arquivo
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo enviado');
  }
  return res.status(201).send({
    fileName: req.file.filename
  });
});

// Rota para ler/baixar arquivo
app.get('/files/:filename', (req, res) => {
  //Para usar dentro do diretorio
  //const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

  const destPath = process.env.DESTINATION_PATH;
  if (!destPath) {
    return res.status(500).send('Variável de ambiente DESTINATION_PATH não configurada');
  }

  const filePath = path.join(destPath, req.params.filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).send('Arquivo não encontrado');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
