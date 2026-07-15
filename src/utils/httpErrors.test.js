import { getPublicErrorMessage } from "./httpErrors";

describe("getPublicErrorMessage", () => {
  test("traduz erros conhecidos e de rede", () => {
    expect(getPublicErrorMessage({ response: { status: 401 } })).toBe("Sua sessão expirou. Entre novamente.");
    expect(getPublicErrorMessage({ response: { status: 413 } })).toBe("O conteúdo enviado ultrapassa o limite permitido.");
    expect(getPublicErrorMessage(new Error("offline"))).toBe("Não foi possível conectar ao servidor.");
  });

  test("preserva mensagem específica segura do backend", () => {
    const error = { response: { status: 409, data: { message: "Este código de campanha já está em uso." } } };
    expect(getPublicErrorMessage(error)).toBe("Este código de campanha já está em uso.");
  });

  test("não expõe mensagem interna", () => {
    const error = { response: { status: 500, data: { message: "Mongoose stack at controller.js:40" } } };
    expect(getPublicErrorMessage(error)).toBe("Não foi possível concluir a operação.");
  });
});
