# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ee506ff2-f35d-4130-9ddb-fd3727716c89

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ee506ff2-f35d-4130-9ddb-fd3727716c89) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Assistant Configuration

O comportamento do assistente é definido através de um Assistente criado no
painel da OpenAI. As instruções do Assistente ficam versionadas em
[`public/assistant-instructions.md`](public/assistant-instructions.md).

Use o script abaixo para sincronizar essas instruções com a OpenAI e salvar o
identificador do assistente na variável de ambiente `ASSISTANT_ID`:

```sh
npm run sync-assistant
```

Certifique-se de definir a variável `OPENAI_API_KEY` e, opcionalmente,
`OPENAI_ASSISTANT_MODEL` antes de executar o script. Caso não exista um
assistente ainda, um novo será criado usando o modelo informado (padrão
`gpt-4o-mini`).

No aplicativo, o identificador do assistente é recuperado dinamicamente através
da function `get-assistant-discovery`, portanto nenhuma variável de ambiente é
necessária para isso.

## Segurança

A function `chat-openai` agora limita o acesso CORS aos domínios definidos na
variável de ambiente `ALLOWED_ORIGINS` (lista separada por vírgulas). Os logs da
function são sanitizados para evitar o registro de dados sensíveis.

```sh
# Exemplo
ALLOWED_ORIGINS=https://exemplo.com,https://app.exemplo.com
```

> **Nota:** avalie implementar mecanismos adicionais de rate limiting ou uma
> autenticação mais estrita conforme necessário para o seu ambiente.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ee506ff2-f35d-4130-9ddb-fd3727716c89) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
