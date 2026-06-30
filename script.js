const darkMode = document.querySelector("#darkmode");
const overlay = document.querySelector("#overlay");
const modal = document.querySelector(".modal");
const addTransaction = document.querySelector("#sidebar-footer button");
const table = document.querySelector("#c2rb-table");
const tableDiv = document.querySelector("#c2rb-transactions");
const form = document.querySelector("#transactionForm");
const submitBtn = document.querySelector("#submitBtn");
const reset = document.querySelector("#c2-left button");
const closeBtn = document.querySelector("#closeBtn");
const cb = document.querySelector("#cb");
const ti = document.querySelector("#ti");
const te = document.querySelector("#te");
const tt = document.querySelector("#tt");
const searchInput = document.querySelector("#c2rb-search input");
const typeFilter = document.querySelector("#types");
const settingBtn = document.querySelector("#settingBtn");
const dashboardBtn = document.querySelector("#dashboardBtn");
const content = document.querySelector("#content");
const settings = document.querySelector("#settings");
const name = document.querySelector("#user-name");
const settingForm = document.querySelector("#settings-card");

let credit = 0,
  debit = 0,
  current_balance = 0,
  total_transactions = 0,
  editInd = null,
  myChart = null,
  currency = "",
  currrencySymbol = "";
const currencySign = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  JPY: "¥",
  GBP: "£",
};

const products = localStorage.getItem("products")
  ? JSON.parse(localStorage.getItem("products"))
  : [];

settingBtn.addEventListener("click", () => {
  console.log("setting");
  settings.classList.remove("hidden");
  content.classList.add("hidden");
  dashboardBtn.classList.remove("active");
  settingBtn.classList.add("active");
});
dashboardBtn.addEventListener("click", () => {
  console.log("dashboard");
  settings.classList.add("hidden");
  content.classList.remove("hidden");
  dashboardBtn.classList.add("active");
  settingBtn.classList.remove("active");
});
const updateChart = (data) => {
  let income = 0,
    expense = 0;

  data.forEach((prod) => {
    if (prod.type === "Income") income += parseFloat(prod.amount);
    else expense += parseFloat(prod.amount);
  });
  if (myChart) myChart.destroy();

  const ctx = document.querySelector("#myChart");

  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          label: "Amount",
          data: [income, expense],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderRadius: 8,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};
function filterFunction() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  const type = typeFilter.value;

  let filteredProds = [...products];

  if (searchQuery.length >= 2) {
    filteredProds = filteredProds.filter(
      (prod) =>
        prod.description.toLowerCase().includes(searchQuery) ||
        prod.category.toLowerCase().includes(searchQuery),
    );
  }

  if (type === "Income") {
    filteredProds = filteredProds.filter((prod) => prod.type === "Income");
  } else if (type === "Expense") {
    filteredProds = filteredProds.filter((prod) => prod.type === "Expense");
  }

  ui(filteredProds);
}
searchInput.addEventListener("input", filterFunction);
typeFilter.addEventListener("change", filterFunction);

const settingsUi = () => {
  currency = localStorage.getItem("currency") || "INR";
  currencySymbol = currencySign[currency];
  let savedName = localStorage.getItem("userName") || "User";
  name.innerText = savedName;

  settingForm[0].value = savedName;
  settingForm[1].value = currency;
};

settingsUi();
const ui = (data = products) => {
  tableDiv.innerHTML = "";
  credit = 0;
  debit = 0;
  data.forEach((prod, ind) => {
    if (prod.type === "Income") credit += parseFloat(prod.amount);
    else debit += parseFloat(prod.amount);
    tableDiv.innerHTML += `
    <div class="transaction">
      <h3>${prod.date}</h3>
      <h3>${prod.description}</h3>
      <h3>${prod.category}</h3>
      <h3 class="${prod.type === "Income" ? "green" : "red"}">${currencySymbol}${parseFloat(prod.amount).toFixed(2)}</h3>
      <div class="actions">
        <i class="ri-edit-2-fill" onclick="editProduct(${products.indexOf(prod)})"></i>
        <i class="ri-delete-bin-7-fill" onclick="deleteProduct(${products.indexOf(prod)})"></i>
      </div>
    </div>
    `;
  });
  current_balance = parseFloat(credit - debit).toFixed(2);
  //console.log(current_balance,credit,debit)
  // if(current_balance<0){
  //   cb.innerText = "-"+currency+Math.abs(current_balance)
  // }else{
  //   cb.innerText = currency+(current_balance)
  // }
  cb.innerText =
    current_balance < 0
      ? "-" + currencySymbol + Math.abs(current_balance)
      : currencySymbol + current_balance;
  ti.innerText = currencySymbol + credit.toFixed(2);
  te.innerText = currencySymbol + debit.toFixed(2);
  tt.innerText = products.length;
  updateChart(data);
};
ui(products);
const deleteProduct = (ind) => {
  products.splice(ind, 1);
  localStorage.setItem("products", JSON.stringify(products));
  ui();
};
const editProduct = (ind) => {
  editInd = ind;
  overlay.classList.remove("hidden");
  submitBtn.textContent = "Update Product";
  form[0].value = products[ind].type;
  form[1].value = products[ind].description;
  form[2].value = products[ind].amount;
  form[3].value = products[ind].date;
  form[4].value = products[ind].category;
  ui();
};
settingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(settingForm[0].value, settingForm[1].value);
  //if(!settingForm[0].value.trim() || !settingForm[1].value) return alert("Please fill all the fields")

  let userName = settingForm[0].value.trim();
  let currencySelect = settingForm[1].value;

  localStorage.setItem("userName", userName);
  localStorage.setItem("currency", currencySelect);

  currency = currencySelect;
  currencySymbol = currencySign[currency];
  name.textContent = userName;
  ui();
  alert("Settings Updated");
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(
    form[0].value,
    form[1].value,
    form[2].value,
    form[3].value,
    form[4].value,
  );
  if (
    !form[0].value.trim() ||
    !form[1].value.trim() ||
    !form[2].value.trim() ||
    !form[3].value.trim() ||
    !form[4].value.trim()
  )
    return alert("Please fill all the fields");
  if (editInd !== null) {
    products[editInd] = {
      type: form[0].value,
      description: form[1].value,
      amount: form[2].value,
      date: form[3].value,
      category: form[4].value,
    };
    submitBtn.textContent = "Add Product";
    editInd = null;
  } else {
    products.push({
      type: form[0].value,
      description: form[1].value,
      amount: form[2].value,
      date: form[3].value,
      category: form[4].value,
    });
  }
  localStorage.setItem("products", JSON.stringify(products));
  ui();
  form.reset();
  overlay.classList.add("hidden");
});

reset.addEventListener("click", () => {
  localStorage.removeItem("products");
  products.length = 0;
  credit = 0;
  debit = 0;
  current_balance = 0;
  ui();
  alert("All Transactions Deleted");
});
addTransaction.addEventListener("click", () => {
  document.querySelector("#overlay").classList.remove("hidden");
});
const closeModal = () => {
  editInd = null;
  form.reset();
  submitBtn.textContent = "Add Product";
  overlay.classList.add("hidden");
};
overlay.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  darkMode.checked = true;
}

// Toggle theme
darkMode.addEventListener("change", () => {
  if (darkMode.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
});
