const getSilgum = () => {
  fetch("./silgum", {
    method: "POST", // 또는 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
  });
};
