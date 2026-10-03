noticeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const notices = getNotices();
  const id = noticeIdField.value.trim();

  const record = {
    id: id || cryptoId(),
    title: titleInput.value.trim(),
    department: departmentInput.value,
    priority: priorityInput.value,
    content: contentInput.value.trim(),
    attachmentUrl: attachmentInput.value.trim(),
    postedOn: new Date().toISOString().split("T")[0],
    expiryDate: expiryInput.value || ""
  };

  if (!record.title || !record.department || !record.content) {
    alert("Please fill all required fields.");
    return;
  }

  if (id) {
    const index = notices.findIndex(n => n.id === id);

    if (index !== -1) {
      record.postedOn = notices[index].postedOn;
      notices[index] = record;
    }
  } else {
    notices.push(record);
  }

  saveNotices(notices);

  alert(id ? "Notice updated successfully!" : "Notice added successfully!");

  resetForm();
  renderTable();
});