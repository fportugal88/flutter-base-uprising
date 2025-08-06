import fs from 'fs';
import path from 'path';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set');
    process.exit(1);
  }

  const model = process.env.OPENAI_ASSISTANT_MODEL || 'gpt-4o-mini';
  const instructionsPath = path.join(process.cwd(), 'public', 'assistant-instructions.md');
  const instructions = fs.readFileSync(instructionsPath, 'utf8');

  let assistantId = "asst_Oh75yptf7Tj8hLDVJJ2o9CqC";

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (assistantId) {
    const resp = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ instructions })
    });

    if (!resp.ok) {
      console.error('Failed to update assistant:', await resp.text());
      process.exit(1);
    }

    console.log('Assistant updated:', assistantId);
  } else {
    const resp = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, instructions })
    });

    if (!resp.ok) {
      console.error('Failed to create assistant:', await resp.text());
      process.exit(1);
    }

    const data = await resp.json();
    assistantId = data.id;

    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    envContent = envContent.replace(/ASSISTANT_ID=.*/g, '')
                           .replace(/VITE_ASSISTANT_ID=.*/g, '');
    envContent += `\nASSISTANT_ID=${assistantId}\nVITE_ASSISTANT_ID=${assistantId}\n`;
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('Assistant created. ID stored in .env:', assistantId);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
