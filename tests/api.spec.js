import { test, expect } from "@playwright/test";
import { TodoBuilder } from "../src/builders/index";

test.describe("API challenge", () => {
  let URL = "https://apichallenges.herokuapp.com/";
  let token;

  test.beforeAll(async ({ request }) => {
    let response = await request.post(`${URL}challenger`);
    let headers = await response.headers();
    token = headers["x-challenger"];
    console.log("Токен " + token);

    expect(headers).toEqual(
      expect.objectContaining({ "x-challenger": expect.any(String) })
    );
  });

  test("02/GET /challenges (200) @api", async ({ request }) => {
    let response = await request.get(`${URL}challenges`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.challenges.length).toBe(59);
  });

  test("03/GET /todos (200) @api", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.todos.length).toBe(10);
  });

  test("04/GET /todo (404) not plural @api", async ({ request }) => {
    let response = await request.get(`${URL}todo`, {
      headers: {
        "x-challenger": token,
      },
    });
    expect(response.status()).toBe(404);
  });

  test("05/GET /todos/{id} (200) @api", async ({ request }) => {
    let response = await request.get(`${URL}todos/1`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.todos.length).toBe(1);
    expect(body.todos[0].title).toBe("scan paperwork");
    expect(body.todos[0].doneStatus).toBe(false);
  });

  test("06/GET /todos/{id} (404) @api", async ({ request }) => {
    let response = await request.get(`${URL}todos/79`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(404);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain(
      "Could not find an instance with todos"
    );
  });

  test("07/GET /todos (200) ?filter @api", async ({ request }) => {
    let response = await request.get(`${URL}todos?doneStatus=false`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.todos[0].doneStatus).toBe(false);
  });

  test("08/HEAD /todos (200) @api", async ({ request }) => {
    let response = await request.head(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("09/POST /todos (201) @api", async ({ request }) => {
     const createTodo = new TodoBuilder()
      .addTitle()
      .addDoneStatus(false)
      .addDescription()
      .generate();

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(201);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.doneStatus).toEqual(false);
    expect(body.title).toBe("Прочти ещё пару интересных русских народных сказок");
    expect(body.description).toBe(
      "Прочти ещё пару интересных русских народных сказок, да сходи отдохни"
    );
  });

  test("10/POST /todos (400) doneStatus @api", async ({ request }) => {
    const createTodo = {
      ...new TodoBuilder()
        .addTitle()
        .addDescription()
        .generate(),
      doneStatus: "hello" 
    };

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain(
      "Failed Validation: doneStatus should be BOOLEAN"
    );
  });

  test("11/POST /todos (400) title too long @api", async ({ request }) => {
    const createTodo = new TodoBuilder()
      .withTooLongTitle() 
      .addDoneStatus(true)
      .addDescription()
      .generate();

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain(
      "Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50"
    );
  });

  test("12/POST /todos (400) description too long @api", async ({ request }) => {
    const createTodo = new TodoBuilder()
      .addTitle()
      .addDoneStatus(true)
      .withTooLongDescription() 
      .generate();

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain(
      "Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200"
    );
  });

  test("13/POST /todos (201) max out content @api", async ({ request }) => {
    const createTodo = new TodoBuilder()
      .withMaxLengthContent()
      .addDoneStatus(true)
      .generate();

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(201);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.doneStatus).toEqual(true);
    expect(body.title).toBe("Прочти ещё пару интересных русских народных сказок");
    expect(body.description).toBe("Прочти ещё пару интересных русских народных сказок, Прочти ещё пару интересных русских народных сказок, Прочти ещё пару интересных русских народных сказок, Прочти ещё пару интересных русских народных "
    );
  });

  test("14/POST /todos (413) content too long @api", async ({ request }) => {
    const createTodo = new TodoBuilder()
      .addTitle("Прочти ещё пару интересных русских народных сказоккк")
      .addDoneStatus(true)
      .withVeryLongDescription() // ИЗМЕНЕНИЕ: Метод с очень длинным описанием
      .generate();

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(413);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain(
      "Request body too large, max allowed is 5000 bytes"
    );
  });

  test("15/POST /todos (400) extra @api", async ({ request }) => {
    const createTodo = {
      ...new TodoBuilder()
        .withMaxLengthContent()
        .addDoneStatus(true)
        .generate(),
      priority: "extra" 
    };

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain("Could not find field: priority");
  });

  test("16/PUT /todos/{id} (400) @api", async ({ request }) => {
    const createTodo = new TodoBuilder()
      .addDoneStatus(true)
      .addDescription("Съешь ещё этих мягких")
      .generate();

    let response = await request.put(`${URL}todos/1551`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain(
      "Cannot create todo with PUT due to Auto fields id"
    );
  });

  test("17/POST /todos/{id} (200) @api", async ({ request }) => {
    const createTodo = new TodoBuilder()
      .addTitle("Прочти ещё пару интересных русских народных сказок")
      .generate();

    let response = await request.post(`${URL}todos/1`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.title).toBe("Прочти ещё пару интересных русских народных сказок");
  });

  test("18/POST /todos/{id} (404) @api", async ({ request }) => {
    const createTodo = new TodoBuilder()
      .addTitle("Съешь ещё")
      .generate();

    let response = await request.post(`${URL}todos/200`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(404);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain(
      "No such todo entity instance with id == 200 found"
    );
  });

  test("19/PUT /todos/{id} full (200) @api", async ({ request }) => {
    const createTodo = {
      ...new TodoBuilder()
        .addTitle("updated title")
        .addDoneStatus(false)
        .addDescription("updated description")
        .generate(),
      id: 3 
    };

    let response = await request.put(`${URL}todos/3`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.id).toBe(3);
    expect(body.title).toBe("updated title");
    expect(body.description).toBe("updated description");
    expect(body.doneStatus).toBe(false);
  });

  test("20/PUT /todos/{id} partial (200) @api", async ({ request }) => {
    const createTodo = { title: "partial update for title" };

    let response = await request.put(`${URL}todos/3`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.id).toBe(3);
    expect(body.title).toBe("partial update for title");
    expect(body.description).toBe("");
    expect(body.doneStatus).toBe(false);
  });

  test("21/PUT /todos/{id} no title (400) @api", async ({ request }) => {
    const createTodo = { description: "partial update for description" };

    let response = await request.put(`${URL}todos/3`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain("title : field is mandatory");
  });

  test("22/PUT /todos/{id} no amend id (400) @api", async ({ request }) => {
    const createTodo = {
      ...new TodoBuilder()
        .addTitle("updated title")
        .generate(),
      id: 4 
    };
    let response = await request.put(`${URL}todos/3`, {
      headers: {
        "x-challenger": token,
      },
      data: createTodo,
    });
    let body = await response.json();
    let headers = await response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.errorMessages[0]).toContain("Can not amend id from 3 to 4");
  });

  test("23/DELETE /todos/{id} (200) @api", async ({ request }) => {
    let response = await request.delete(`${URL}todos/1`, {
      headers: {
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("24/OPTIONS /todos (200) @api", async ({ request }, testinfo) => {
    let response = await request.fetch(`${URL}todos`, {
      method: "OPTIONS",
      headers: {
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers["allow"]).toContain("OPTIONS");
    expect(headers["allow"]).toContain("GET");
    expect(headers["allow"]).toContain("POST");
    expect(headers["allow"]).toContain("HEAD");
    expect(headers["allow"]).not.toContain("PUT");
    expect(headers["allow"]).not.toContain("DELETE");
    expect(headers["allow"]).not.toContain("PATCH");
  });

  test("25/GET /todos (200) XML @api", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        accept: "application/xml",
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    let body = await response.text();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers["content-type"]).toContain("application/xml");
    expect(body.trim().startsWith("<")).toBe(true);
  });

  test("26/GET /todos (200) JSON @api", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        accept: "application/json",
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    let body = await response.json();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers["content-type"]).toContain("application/json");
    expect(typeof body === "object").toBe(true);
  });

  test("27/GET /todos (200) ANY @api", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        accept: "*/*",
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    let body = await response.json();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers["content-type"]).toContain("application/json");
    expect(typeof body === "object").toBe(true);
  });

  test("28/GET /todos (200) XML pref @api", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        accept: "application/xml, application/json",
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    let body = await response.text();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers["content-type"]).toContain("application/xml");
    expect(body.trim().startsWith("<")).toBe(true);
  });

  test("29/GET /todos (200) no accept @api", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    let body = await response.json();
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(headers["content-type"]).toContain("application/json");
    expect(typeof body === "object").toBe(true);
  });

  test("30/GET /todos (406) @api", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        accept: "application/gzip",
        "x-challenger": token,
      },
    });
    let headers = await response.headers();
    let body = await response.json();
    expect(response.status()).toBe(406);
    expect(body.errorMessages).toContain("Unrecognised Accept Type");
  });
});