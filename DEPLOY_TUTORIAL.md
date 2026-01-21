# Tutorial de Deploy (GitHub & Vercel)

Este guia explica como colocar seu site no ar gratuitamente usando GitHub e Vercel.

## Pré-requisitos
1. Uma conta no [GitHub](https://github.com).
2. Uma conta na [Vercel](https://vercel.com).
3. **Node.js** e **NPM** instalados no seu computador.
4. **Git** instalado no seu computador.

---

## Passo 1: Preparar o Projeto Local

1. Abra o terminal na pasta do seu projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Teste se o projeto roda localmente:
   ```bash
   npm run dev
   ```
   (Acesse o link mostrado, geralmente `http://localhost:5173`, e verifique se o site abre).

---

## Passo 2: Subir o Código para o GitHub

1. **Inicialize o Git** (se ainda não fez):
   ```bash
   git init
   ```

2. **Crie um arquivo `.gitignore`** (se não existir) e adicione:
   ```text
   node_modules
   dist
   .env
   ```
   *(Nota: O código que eu gerei já inclui este arquivo).*

3. **Adicione os arquivos e faça o commit:**
   ```bash
   git add .
   git commit -m "Primeiro commit - PediApp"
   ```

4. **Crie um repositório no GitHub:**
   - Vá em [github.com/new](https://github.com/new).
   - Nomeie como `med-cronograma` (ou o nome que preferir).
   - Deixe como **Public** ou **Private**.
   - Clique em **Create repository**.

5. **Conecte e envie o código:**
   - Copie os comandos que o GitHub mostra na seção "...or push an existing repository from the command line".
   - Geralmente são:
     ```bash
     git remote add origin https://github.com/SEU_USUARIO/med-cronograma.git
     git branch -M main
     git push -u origin main
     ```

---

## Passo 3: Deploy na Vercel

A Vercel é a melhor plataforma para apps React/Vite.

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2. Clique em **"Add New..."** > **"Project"**.
3. Em **"Import Git Repository"**, encontre o seu repositório `med-cronograma` e clique em **Import**.
4. **Configurações do Projeto:**
   - **Framework Preset:** A Vercel deve detectar "Vite" automaticamente. Se não, selecione "Vite".
   - **Root Directory:** `./` (padrão).
   - **Environment Variables:** (IMPORTANTE)
     - Clique para expandir.
     - Adicione sua chave da API do Google Gemini:
       - **Name:** `API_KEY`
       - **Value:** `Sua-Chave-Da-Google-AI-Studio`
5. Clique em **Deploy**.

---

## Passo 4: Finalização

- Aguarde cerca de 1 minuto.
- Quando terminar, a Vercel mostrará uma tela com fogos de artifício.
- Clique na imagem do site ou no botão **"Visit"**.
- Seu site agora está online (ex: `https://med-cronograma.vercel.app`).

---

## Solução de Problemas Comuns

- **Tela Branca:** Certifique-se de que removeu o `<script type="importmap">` do `index.html`.
- **Erro de Build:** Verifique se o comando `npm run build` roda sem erros no seu computador antes de subir.
- **API não funciona:** Verifique se você adicionou a `API_KEY` nas variáveis de ambiente da Vercel corretamente.
