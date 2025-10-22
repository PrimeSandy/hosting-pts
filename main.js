
const firebaseConfig = {
    apiKey: "AIzaSyDgeOmsWD36spVcXw9QVSbUs4nmx-iXGak",
    authDomain: "ptspro-31997.firebaseapp.com",
    projectId: "ptspro-31997",
    storageBucket: "ptspro-31997.appspot.com",
    messagingSenderId: "191965542623",
    appId: "1:191965542623:web:b461ceedfc3a773267516a",
    measurementId: "G-6LNC29KRQF"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
let currentUserUid = null;

const loginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("googleLogoutBtn");
const expenseFormContainer = document.getElementById("expenseFormContainer");
const tableContainer = document.getElementById("tableContainer");

// Login
loginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            currentUserUid = user.uid;
            alert(`Welcome ${user.displayName}`);
            toggleLoginState(true);
            loadData(); // reload table after login
        })
        .catch(err => console.error(err));
});

// Logout
logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
        currentUserUid = null;
        toggleLoginState(false);
        loadData(); // reload table after logout
    });
});

function toggleLoginState(isLoggedIn){
    loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
    logoutBtn.style.display = isLoggedIn ? "inline-block" : "none";
    expenseFormContainer.style.display = isLoggedIn ? "block" : "none";
}

// Auto-login
auth.onAuthStateChanged(user => {
    if(user){
        currentUserUid = user.uid;
        toggleLoginState(true);
        loadData(); // table shows correct actions after auto-login
    } else {
        toggleLoginState(false);
        loadData(); // table shows without actions if logged out
    }
});

// Expense Form Submit & Table
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#expenseForm");
    const editId = document.querySelector("#editId");

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const data = {
            name: document.querySelector("#name").value.trim(),
            amount: document.querySelector("#amount").value.trim(),
            type: document.querySelector("#type").value,
            description: document.querySelector("#description").value.trim(),
            date: document.querySelector("#date").value
        };

        if(editId.value){
            await fetch(`/update/${editId.value}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });
            editId.value = "";
        } else {
            await fetch("/submit", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });
        }

        form.reset();
        loadData();
    });

    window.loadData = async function(){
        const res = await fetch("/users");
        const users = await res.json();

        let html = `<table class="table table-striped table-bordered text-white">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead><tbody>`;

        users.forEach(u => {
            const actionBtn = currentUserUid ? 
                `<button class="btn btn-warning btn-sm" onclick="editExpense('${u._id}')">Edit</button>` 
                : '-';
            html += `<tr>
                <td>${u.sid ?? '-'}</td>
                <td>${u.name}</td>
                <td>${u.amount}</td>
                <td>${u.type}</td>
                <td>${u.description}</td>
                <td>${u.date}</td>
                <td>${actionBtn}</td>
            </tr>`;
        });

        html += "</tbody></table>";
        tableContainer.innerHTML = html;
    };

    window.editExpense = async function(id){
        const res = await fetch(`/user/${id}`);
        const user = await res.json();

        document.querySelector("#name").value = user.name;
        document.querySelector("#amount").value = user.amount;
        document.querySelector("#type").value = user.type;
        document.querySelector("#description").value = user.description;
        document.querySelector("#date").value = user.date;
        document.querySelector("#editId").value = id;
    };

    loadData(); // initial table load
});

