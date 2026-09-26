import { handleIdentityRequest } from "../../../../lib/identity/handle-identity-request";
import { getIdentityDependencies } from "../../../../lib/identity/runtime";

// Node.js, não Edge: o driver `pg` de `@saas/db` exige runtime Node, e o ADR-017
// coloca a execução de negócio em funções Vercel padrão.
export const runtime = "nodejs";

// A resposta depende do Authorization de cada requisição e nunca pode ser cacheada.
export const dynamic = "force-dynamic";

async function handle(request: Request): Promise<Response> {
  return handleIdentityRequest(request, getIdentityDependencies());
}

export const GET = handle;

// Os demais verbos são exportados para que o 405 saia no formato do contrato, em
// vez do 405 padrão do Next.js. `OPTIONS` também cai aqui: o preflight deixou de
// ser necessário quando a rota passou a ser same-origin e o CORS saiu.
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
