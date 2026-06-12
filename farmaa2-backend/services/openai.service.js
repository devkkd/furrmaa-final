import axios from 'axios';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

function buildSystemPrompt(petContext) {
  const petLine = petContext?.petName
    ? `The user has a ${petContext.petType || 'pet'} named ${petContext.petName}.`
    : '';

  return `You are Furrmaa Pet AI — a friendly, accurate pet care assistant for the Furrmaa app and website.
${petLine}
Help with: pet health guidance (not a vet replacement), nutrition, behavior, grooming, finding vets, adoption, lost & found, and general pet parenting.
Keep answers clear, concise, and practical. For emergencies or serious illness, advise seeing a veterinarian immediately.
Do not give human medical advice. Stay on pet-related topics.`;
}

/**
 * @param {{ userMessage: string, chatHistory?: Array<{role:string,content:string}>, petContext?: object|null }}
 * @returns {{ content: string, provider: 'openai'|'fallback' }}
 */
export async function generatePetAIReply({ userMessage, chatHistory = [], petContext = null }) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      content: generateFallbackResponse(userMessage, petContext),
      provider: 'fallback',
    };
  }

  const model = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();
  const maxTokens = Math.min(
    Math.max(parseInt(process.env.OPENAI_MAX_TOKENS || '800', 10) || 800, 100),
    4096
  );

  const history = chatHistory
    .filter((m) => m?.role && m?.content && ['user', 'assistant'].includes(m.role))
    .slice(-20)
    .map((m) => ({ role: m.role, content: String(m.content).trim() }));

  const messages = [
    { role: 'system', content: buildSystemPrompt(petContext) },
    ...history,
    { role: 'user', content: String(userMessage).trim() },
  ];

  try {
    const response = await axios.post(
      OPENAI_CHAT_URL,
      {
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('Empty response from OpenAI');
    }

    return { content: text, provider: 'openai' };
  } catch (error) {
    const status = error.response?.status;
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error('OpenAI API error:', status, errMsg);

    return {
      content: generateFallbackResponse(userMessage, petContext),
      provider: 'fallback',
    };
  }
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function generateFallbackResponse(userMessage, petContext) {
  const message = String(userMessage || '').toLowerCase();

  if (message.includes('health') || message.includes('sick') || message.includes('symptom')) {
    return 'For pet health concerns, please consult a veterinarian. You can find nearby vets in the Vet section of Furrmaa. Regular check-ups, good nutrition, and exercise help keep pets healthy.';
  }
  if (message.includes('food') || message.includes('nutrition') || message.includes('diet') || message.includes('feed')) {
    return 'Choose quality pet food suited to your pet\'s age, size, and health. Avoid toxic human foods. Browse pet food in the Furrmaa Shop section.';
  }
  if (message.includes('behavior') || message.includes('training') || message.includes('bark') || message.includes('aggressive')) {
    return 'Consistent training and positive reinforcement help. See our Training section. For serious behavior issues, consult a professional trainer or vet.';
  }
  if (message.includes('groom') || message.includes('bath') || message.includes('clean')) {
    return 'Regular grooming keeps pets healthy. Book grooming via Services. Frequency depends on breed and coat type.';
  }
  if (message.includes('vet') || message.includes('doctor') || message.includes('clinic') || message.includes('hospital')) {
    return 'Find veterinarians in the Vet section. For emergencies, use Emergency features. Regular vet visits are essential.';
  }
  if (message.includes('adopt') || message.includes('adoption')) {
    return 'Check the Adoption section for pets looking for homes. Adoption is a wonderful choice!';
  }
  if (message.includes('lost') || message.includes('found') || message.includes('missing')) {
    return 'Use the Hope section for lost & found posts. Act quickly and contact local shelters and clinics.';
  }

  const petHint = petContext?.petName ? ` I see you have ${petContext.petName} — ask me anything about their care!` : '';
  return `I'm Furrmaa Pet AI.${petHint} Ask about health, nutrition, behavior, grooming, vets, or adoption. (Tip: add OPENAI_API_KEY on the server for ChatGPT-powered replies.)`;
}
