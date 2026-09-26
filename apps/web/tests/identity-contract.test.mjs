import assert from "node:assert/strict";
import test from "node:test";

import { handleIdentityRequest } from "../src/lib/identity/handle-identity-request.ts";

const URL_UNDER_TEST = "https://example.test/api/identity/me";

function request(init = {}) {
  const { method = "GET", authorization, ...rest } = init;
  const headers = new Headers();
  if (authorization !== undefined) headers.set("authorization", authorization);
  return new Request(URL_UNDER_TEST, { method, headers, ...rest });
}

function dependencies(overrides = {}) {
  return {
    verifyAccessToken: async () => ({ subject: "subject-1", email: "person@example.test" }),
    reconcileIdentity: async () => ({ id: "user-1", email: "person@example.test" }),
    logError: () => {},
    ...overrides,
  };
}

async function read(response) {
  return { status: response.status, body: await response.json() };
}

// --- contrato: uma asserção por linha da tabela do Task Packet ---

test("método diferente de GET devolve 405 no formato do contrato", async () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const response = await handleIdentityRequest(request({ method }), dependencies());
    assert.deepEqual(await read(response), {
      status: 405,
      body: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
    });
  }
});

test("requisição sem Authorization devolve 401", async () => {
  const response = await handleIdentityRequest(request(), dependencies());
  assert.deepEqual(await read(response), {
    status: 401,
    body: { code: "UNAUTHENTICATED", message: "Authentication required." },
  });
});

test("Authorization que não casa o padrão Bearer devolve 401", async () => {
  const invalid = ["", "Bearer", "Bearer ", "Basic abc", "Bearer a b", "token abc", "Bearer  abc"];
  for (const authorization of invalid) {
    const response = await handleIdentityRequest(request({ authorization }), dependencies());
    assert.equal(response.status, 401, `esperava 401 para ${JSON.stringify(authorization)}`);
  }
});

test("o esquema Bearer não distingue maiúsculas", async () => {
  for (const authorization of ["Bearer abc", "bearer abc", "BEARER abc"]) {
    const response = await handleIdentityRequest(request({ authorization }), dependencies());
    assert.equal(response.status, 200, `esperava 200 para ${authorization}`);
  }
});

test("ambiente não configurado devolve 503 de serviço não configurado", async () => {
  const response = await handleIdentityRequest(request({ authorization: "Bearer abc" }), null);
  assert.deepEqual(await read(response), {
    status: 503,
    body: { code: "IDENTITY_SERVICE_UNAVAILABLE", message: "Identity service is not configured." },
  });
});

test("token inválido devolve 401", async () => {
  const response = await handleIdentityRequest(
    request({ authorization: "Bearer abc" }),
    dependencies({ verifyAccessToken: async () => null }),
  );
  assert.deepEqual(await read(response), {
    status: 401,
    body: { code: "UNAUTHENTICATED", message: "Authentication required." },
  });
});

test("falha na reconciliação devolve 503 temporário sem vazar detalhe", async () => {
  const response = await handleIdentityRequest(
    request({ authorization: "Bearer abc" }),
    dependencies({
      reconcileIdentity: async () => {
        throw new Error('connection to server at "db.internal" failed: password authentication');
      },
    }),
  );
  const { status, body } = await read(response);
  assert.equal(status, 503);
  assert.deepEqual(body, {
    code: "IDENTITY_SERVICE_UNAVAILABLE",
    message: "Identity service is temporarily unavailable.",
  });
  assert.ok(!JSON.stringify(body).includes("db.internal"), "o corpo não pode vazar detalhe do driver");
});

test("sucesso devolve 200 com o usuário mínimo", async () => {
  const response = await handleIdentityRequest(request({ authorization: "Bearer abc" }), dependencies());
  assert.deepEqual(await read(response), {
    status: 200,
    body: { user: { id: "user-1", email: "person@example.test" } },
  });
});

// --- segurança ---

test("toda resposta leva Cache-Control no-store e JSON", async () => {
  const cases = [
    [request({ method: "POST" }), dependencies()],
    [request(), dependencies()],
    [request({ authorization: "Bearer abc" }), null],
    [request({ authorization: "Bearer abc" }), dependencies({ verifyAccessToken: async () => null })],
    [request({ authorization: "Bearer abc" }), dependencies()],
  ];
  for (const [input, deps] of cases) {
    const response = await handleIdentityRequest(input, deps);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("content-type"), "application/json");
  }
});

test("nenhum header de CORS é emitido — a rota é same-origin", async () => {
  const response = await handleIdentityRequest(request({ authorization: "Bearer abc" }), dependencies());
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(response.headers.get("access-control-allow-headers"), null);
  assert.equal(response.headers.get("access-control-allow-methods"), null);
});

test("sem credencial o estado de configuração não é revelado", async () => {
  // Requisição sem Bearer contra ambiente não configurado precisa devolver 401,
  // não 503: quem não se identificou não fica sabendo se o serviço está montado.
  const response = await handleIdentityRequest(request(), null);
  assert.equal(response.status, 401);
});

test("a reconciliação usa somente o que veio do token verificado", async () => {
  let received = null;
  const response = await handleIdentityRequest(
    new Request(URL_UNDER_TEST, {
      method: "GET",
      headers: {
        authorization: "Bearer abc",
        // campos não confiáveis, que não podem influenciar o resultado
        "x-user-id": "injetado",
        "x-user-email": "atacante@example.test",
      },
    }),
    dependencies({
      verifyAccessToken: async () => ({ subject: "subject-real", email: "real@example.test" }),
      reconcileIdentity: async (identity) => {
        received = identity;
        return { id: "user-real", email: identity.email };
      },
    }),
  );

  assert.deepEqual(received, { subject: "subject-real", email: "real@example.test" });
  assert.deepEqual(await read(response), {
    status: 200,
    body: { user: { id: "user-real", email: "real@example.test" } },
  });
});

test("o token é repassado íntegro ao verificador", async () => {
  let seen = null;
  await handleIdentityRequest(
    request({ authorization: "Bearer eyJhbGciOi.Zm9v.YmFy" }),
    dependencies({
      verifyAccessToken: async (token) => {
        seen = token;
        return { subject: "s", email: "e@example.test" };
      },
    }),
  );
  assert.equal(seen, "eyJhbGciOi.Zm9v.YmFy");
});

test("a falha de reconciliação é registrada sem expor o token", async () => {
  const logged = [];
  await handleIdentityRequest(
    request({ authorization: "Bearer segredo-do-token" }),
    dependencies({
      reconcileIdentity: async () => {
        throw new Error("boom");
      },
      logError: (message, detail) => logged.push({ message, detail }),
    }),
  );

  assert.equal(logged.length, 1);
  assert.equal(logged[0].message, "identity reconciliation failed");
  assert.ok(!JSON.stringify(logged[0]).includes("segredo-do-token"), "o log não pode conter o token");
});
