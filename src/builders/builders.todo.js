
export class TodoBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.data = {
      title: "",
      doneStatus: false,
      description: ""
    };
    return this;
  }

  addTitle(title = "Прочти ещё пару интересных русских народных сказок") {
    this.data.title = title;
    return this;
  }

  addDoneStatus(doneStatus = false) {
    this.data.doneStatus = doneStatus;
    return this;
  }

  addDescription(description = "Прочти ещё пару интересных русских народных сказок, да сходи отдохни") {
    this.data.description = description;
    return this;
  }

  withTooLongTitle() {
    this.data.title = "Прочти ещё пару интересных русских народных сказок, и сходи отдохни!";
    return this;
  }

  withTooLongDescription() {
    this.data.description = "Прочти ещё пару интересных русских народных сказок, сходи отдохни".repeat(5);
    return this;
  }

  withMaxLengthContent() {
    this.data.title = "Прочти ещё пару интересных русских народных сказок";
    this.data.description = "Прочти ещё пару интересных русских народных сказок, Прочти ещё пару интересных русских народных сказок, Прочти ещё пару интересных русских народных сказок, Прочти ещё пару интересных русских народных ";
    return this;
  }

  withVeryLongDescription() {
    this.data.description = "Прочти ещё пару интересных русских народных сказок, да сходи отдохни".repeat(120);
    return this;
  }

  generate() {
    const result = { ...this.data };
    this.reset();
    return result;
  }
}
