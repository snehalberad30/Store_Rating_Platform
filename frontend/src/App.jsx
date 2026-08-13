import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

const headers = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    address: "",
    password: ""
  });

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setToken(response.data.token);
      setUser(response.data.user);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      alert(response.data?.message || "Registration successful.");
      setRegisterData({ name: "", email: "", address: "", password: "" });
      setShowRegister(false);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Store Rating Platform</h1>
          <p>{showRegister ? "Register as a Normal User" : "Login to continue"}</p>

          <form onSubmit={showRegister ? register : login}>
            {showRegister && (
              <>
                <label>Name</label>
                <input
                  value={registerData.name}
                  minLength={20}
                  maxLength={60}
                  required
                  placeholder="20-60 characters"
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                />

                <label>Address</label>
                <input
                  value={registerData.address}
                  maxLength={400}
                  required
                  placeholder="Address"
                  onChange={(e) =>
                    setRegisterData({ ...registerData, address: e.target.value })
                  }
                />
              </>
            )}

            <label>Email</label>
            <input
              type="email"
              required
              value={showRegister ? registerData.email : email}
              placeholder="Enter email"
              onChange={(e) =>
                showRegister
                  ? setRegisterData({ ...registerData, email: e.target.value })
                  : setEmail(e.target.value)
              }
            />

            <label>Password</label>
            <input
              type="password"
              required
              minLength={8}
              maxLength={16}
              value={showRegister ? registerData.password : password}
              placeholder="8-16 characters"
              onChange={(e) =>
                showRegister
                  ? setRegisterData({ ...registerData, password: e.target.value })
                  : setPassword(e.target.value)
              }
            />

            {showRegister && (
              <small>
                Password must be 8-16 characters and contain uppercase + special character.
              </small>
            )}

            {error && <div className="error">{error}</div>}

            <button className="primary-btn" type="submit" disabled={loading}>
              {showRegister ? "Register" : loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <button
            className="secondary-btn"
            onClick={() => {
              setShowRegister(!showRegister);
              setError("");
            }}
          >
            {showRegister ? "Back to Login" : "Create New Account"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <div>
          <h2>Store Rating Platform</h2>
          <span>{user.name || "User"} | {user.role}</span>
        </div>

        <div>
          {(user.role === "USER" || user.role === "STORE_OWNER") && (
            <button
              className="secondary-btn"
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginRight: "10px" }}
            >
              {showPassword ? "Close Password" : "Change Password"}
            </button>
          )}

          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="container">
        {showPassword && (
          <ChangePassword
            token={token}
            role={user.role}
            close={() => setShowPassword(false)}
          />
        )}

        {(user.role === "ADMIN" || user.role === "OPERATOR") && (
          <AdminDashboard token={token} />
        )}

        {user.role === "USER" && <UserDashboard token={token} />}

        {user.role === "STORE_OWNER" && <OwnerDashboard token={token} />}
      </main>
    </div>
  );
}

/* ================= CHANGE PASSWORD ================= */

function ChangePassword({ token, role, close }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      form.newPassword.length < 8 ||
      form.newPassword.length > 16 ||
      !/[A-Z]/.test(form.newPassword) ||
      !/[^A-Za-z0-9]/.test(form.newPassword)
    ) {
      setError(
        "New password must be 8-16 characters with at least one uppercase and one special character."
      );
      return;
    }

    try {
      const endpoint =
        role === "STORE_OWNER"
          ? `${API}/owner/password`
          : `${API}/users/password`;

      const response = await axios.put(endpoint, form, headers(token));
      setMessage(response.data?.message || "Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Password update failed. Check the backend password route."
      );
    }
  };

  return (
    <section className="card">
      <h2>Change Password</h2>

      <form onSubmit={submit}>
        <label>Current Password</label>
        <input
          type="password"
          value={form.currentPassword}
          required
          onChange={(e) =>
            setForm({ ...form, currentPassword: e.target.value })
          }
        />

        <label>New Password</label>
        <input
          type="password"
          value={form.newPassword}
          minLength={8}
          maxLength={16}
          required
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value })
          }
        />

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <button className="primary-btn" type="submit">
          Update Password
        </button>
        <button className="secondary-btn" type="button" onClick={close}>
          Close
        </button>
      </form>
    </section>
  );
}

/* ================= ADMIN ================= */

function AdminDashboard({ token }) {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUser, setShowUser] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [userSearch, setUserSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [userSort, setUserSort] = useState("name");
  const [userOrder, setUserOrder] = useState("ASC");

  const [storeSearch, setStoreSearch] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeSort, setStoreSort] = useState("name");
  const [storeOrder, setStoreOrder] = useState("ASC");

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "USER"
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: ""
  });

  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const h = headers(token);

      const [d, u, s] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, h),
        axios.get(`${API}/admin/users`, h),
        axios.get(`${API}/admin/stores`, h)
      ]);

      setDashboard(d.data.data);
      setUsers(u.data.users || []);
      setStores(s.data.stores || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const owners = users.filter((u) => u.role === "STORE_OWNER");

  const filteredUsers = useMemo(() => {
    let list = users.filter((u) =>
      (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) &&
      (u.email || "").toLowerCase().includes(userEmail.toLowerCase()) &&
      (u.address || "").toLowerCase().includes(userAddress.toLowerCase()) &&
      (!roleFilter || u.role === roleFilter)
    );

    list.sort((a, b) => {
      const av = String(a[userSort] || "").toLowerCase();
      const bv = String(b[userSort] || "").toLowerCase();
      return userOrder === "ASC" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [users, userSearch, userEmail, userAddress, roleFilter, userSort, userOrder]);

  const filteredStores = useMemo(() => {
    let list = stores.filter((s) =>
      (s.name || "").toLowerCase().includes(storeSearch.toLowerCase()) &&
      (s.email || "").toLowerCase().includes(storeEmail.toLowerCase()) &&
      (s.address || "").toLowerCase().includes(storeAddress.toLowerCase())
    );

    list.sort((a, b) => {
      const av = String(a[storeSort] || "").toLowerCase();
      const bv = String(b[storeSort] || "").toLowerCase();
      return storeOrder === "ASC" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [stores, storeSearch, storeEmail, storeAddress, storeSort, storeOrder]);

  const createUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setMessage("");

    try {
      const response = await axios.post(`${API}/admin/users`, userForm, headers(token));
      setMessage(response.data?.message || "User created successfully.");
      setUserForm({ name: "", email: "", address: "", password: "", role: "USER" });
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create user.");
    }
  };

  const createStore = async (e) => {
    e.preventDefault();
    setFormError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/admin/stores`,
        {
          ...storeForm,
          ownerId: storeForm.ownerId ? Number(storeForm.ownerId) : null
        },
        headers(token)
      );

      setMessage(response.data?.message || "Store created successfully.");
      setStoreForm({ name: "", email: "", address: "", ownerId: "" });
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create store.");
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await axios.get(`${API}/admin/users/${id}`, headers(token));
      setSelectedUser(response.data.user);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load user details.");
    }
  };

  if (loading) return <h2>Loading Admin Dashboard...</h2>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h1>Admin Dashboard</h1>

      <div className="stats">
        <div className="stat-card"><h3>Total Users</h3><strong>{dashboard?.totalUsers ?? 0}</strong></div>
        <div className="stat-card"><h3>Total Stores</h3><strong>{dashboard?.totalStores ?? 0}</strong></div>
        <div className="stat-card"><h3>Total Ratings</h3><strong>{dashboard?.totalRatings ?? 0}</strong></div>
      </div>

      <section className="card">
        <h2>Admin Actions</h2>
        <button className="primary-btn" onClick={() => { setShowUser(!showUser); setShowStore(false); }}>
          {showUser ? "Close" : "+ Add User / Admin / Store Owner"}
        </button>

        <button className="primary-btn" style={{ marginLeft: 10 }}
          onClick={() => { setShowStore(!showStore); setShowUser(false); }}>
          {showStore ? "Close" : "+ Add Store"}
        </button>
      </section>

      {(message || formError) && (
        <section className="card">
          {message && <div className="success">{message}</div>}
          {formError && <div className="error">{formError}</div>}
        </section>
      )}

      {showUser && (
        <section className="card">
          <h2>Add User / Admin / Store Owner</h2>
          <form onSubmit={createUser}>
            <label>Name</label>
            <input value={userForm.name} minLength={20} maxLength={60} required
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />

            <label>Email</label>
            <input type="email" value={userForm.email} required
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />

            <label>Address</label>
            <input value={userForm.address} maxLength={400} required
              onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} />

            <label>Password</label>
            <input type="password" value={userForm.password} minLength={8} maxLength={16} required
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />

            <label>Role</label>
            <select value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="USER">Normal User</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>

            <button className="primary-btn" type="submit">Create User</button>
          </form>
        </section>
      )}

      {showStore && (
        <section className="card">
          <h2>Add New Store</h2>
          <form onSubmit={createStore}>
            <label>Store Name</label>
            <input value={storeForm.name} minLength={20} maxLength={60} required
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} />

            <label>Store Email</label>
            <input type="email" value={storeForm.email} required
              onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} />

            <label>Store Address</label>
            <input value={storeForm.address} maxLength={400} required
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} />

            <label>Assign Store Owner</label>
            <select value={storeForm.ownerId}
              onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}>
              <option value="">Select Store Owner</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.name} - {o.email}</option>
              ))}
            </select>

            <button className="primary-btn" type="submit">Create Store</button>
          </form>
        </section>
      )}

      <section className="card">
        <h2>Users</h2>

        <div className="filter-row">
          <input placeholder="Filter Name" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
          <input placeholder="Filter Email" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
          <input placeholder="Filter Address" value={userAddress} onChange={e => setUserAddress(e.target.value)} />

          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
          </select>

          <select value={userSort} onChange={e => setUserSort(e.target.value)}>
            <option value="name">Sort Name</option>
            <option value="email">Sort Email</option>
            <option value="address">Sort Address</option>
            <option value="role">Sort Role</option>
          </select>

          <button className="secondary-btn"
            onClick={() => setUserOrder(userOrder === "ASC" ? "DESC" : "ASC")}>
            {userOrder === "ASC" ? "↑ ASC" : "↓ DESC"}
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Role</th><th>Details</th></tr></thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.address}</td>
                  <td>{u.role}</td>
                  <td><button className="secondary-btn" onClick={() => viewDetails(u.id)}>View</button></td>
                </tr>
              ))}
              {!filteredUsers.length && <tr><td colSpan="5">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selectedUser && (
        <section className="card">
          <h2>User Details</h2>
          <p><b>Name:</b> {selectedUser.name}</p>
          <p><b>Email:</b> {selectedUser.email}</p>
          <p><b>Address:</b> {selectedUser.address}</p>
          <p><b>Role:</b> {selectedUser.role}</p>

          {selectedUser.role === "STORE_OWNER" && (
            <>
              <h3>Owner Stores</h3>
              {selectedUser.stores?.length ? (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Rating</th></tr></thead>
                    <tbody>
                      {selectedUser.stores.map(s => (
                        <tr key={s.id}>
                          <td>{s.name}</td><td>{s.email}</td><td>{s.address}</td>
                          <td>{Number(s.averageRating || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No store assigned.</p>}
            </>
          )}

          <button className="secondary-btn" onClick={() => setSelectedUser(null)}>Close</button>
        </section>
      )}

      <section className="card">
        <h2>Stores</h2>

        <div className="filter-row">
          <input placeholder="Filter Name" value={storeSearch} onChange={e => setStoreSearch(e.target.value)} />
          <input placeholder="Filter Email" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} />
          <input placeholder="Filter Address" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} />

          <select value={storeSort} onChange={e => setStoreSort(e.target.value)}>
            <option value="name">Sort Name</option>
            <option value="email">Sort Email</option>
            <option value="address">Sort Address</option>
          </select>

          <button className="secondary-btn"
            onClick={() => setStoreOrder(storeOrder === "ASC" ? "DESC" : "ASC")}>
            {storeOrder === "ASC" ? "↑ ASC" : "↓ DESC"}
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Rating</th><th>Owner</th></tr></thead>
            <tbody>
              {filteredStores.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>{Number(s.rating || 0).toFixed(2)}</td>
                  <td>{s.owner_id || "-"}</td>
                </tr>
              ))}
              {!filteredStores.length && <tr><td colSpan="5">No stores found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ================= USER ================= */

function UserDashboard({ token }) {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [ratingValues, setRatingValues] = useState({});
  const [loading, setLoading] = useState(true);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/users/stores`, headers(token));
      setStores(response.data.stores || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load stores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [token]);

  const submitRating = async (storeId, currentRating) => {
    const value = Number(ratingValues[storeId] || currentRating);

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      alert("Please select a rating between 1 and 5.");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/users/ratings`,
        { storeId: Number(storeId), rating: value },
        headers(token)
      );

      alert(response.data?.message || "Rating saved successfully.");
      await loadStores();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save rating.");
    }
  };

  const filtered = stores.filter(s =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.address || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <h2>Loading Stores...</h2>;

  return <>
    <h1>Stores</h1>

    <input
      className="search"
      placeholder="Search store by name or address"
      value={search}
      onChange={e => setSearch(e.target.value)}
    />

    <div className="store-grid">
      {filtered.map(s => (
        <div className="store-card" key={s.id}>
          <h2>{s.name}</h2>
          <p>{s.address}</p>
          <p><b>Overall Rating:</b> {Number(s.average_rating || s.rating || 0).toFixed(2)}</p>
          <p><b>Your Rating:</b> {s.user_rating ?? "Not rated"}</p>

          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                type="button"
                key={n}
                className={Number(ratingValues[s.id]) === n ? "rating-btn selected" : "rating-btn"}
                onClick={() => setRatingValues({ ...ratingValues, [s.id]: n })}
              >
                {n} ⭐
              </button>
            ))}
          </div>

          <button className="primary-btn"
            onClick={() => submitRating(s.id, s.user_rating)}>
            {s.user_rating ? "Modify Rating" : "Submit Rating"}
          </button>
        </div>
      ))}

      {!filtered.length && <p>No stores found.</p>}
    </div>
  </>;
}

/* ================= OWNER ================= */

function OwnerDashboard({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/owner/dashboard`, headers(token))
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || "Failed to load owner dashboard."));
  }, [token]);

  if (error) return <div className="error">{error}</div>;
  if (!data) return <h2>Loading Store Owner Dashboard...</h2>;

  const stores = data.stores || [];
  const ratingUsers = data.ratingUsers || [];

  return <>
    <h1>Store Owner Dashboard</h1>

    {stores.length ? stores.map(s => (
      <section className="card" key={s.id}>
        <h2>{s.name}</h2>
        <p>{s.address}</p>

        <div className="stats">
          <div className="stat-card">
            <h3>Average Rating</h3>
            <strong>{Number(s.averageRating || 0).toFixed(2)} ⭐</strong>
          </div>

          <div className="stat-card">
            <h3>Total Ratings</h3>
            <strong>{s.totalRatings || 0}</strong>
          </div>
        </div>
      </section>
    )) : (
      <section className="card">
        <h2>No Store Found</h2>
        <p>No store is assigned to this owner.</p>
      </section>
    )}

    <section className="card">
      <h2>Users Who Submitted Ratings</h2>

      {ratingUsers.length ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Store</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {ratingUsers.map((x, i) => (
                <tr key={`${x.store_id}-${x.user_id}-${i}`}>
                  <td>{x.name}</td>
                  <td>{x.email}</td>
                  <td>{x.store_name}</td>
                  <td>{x.rating} ⭐</td>
                  <td>{x.created_at ? new Date(x.created_at).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p>No ratings submitted yet.</p>}
    </section>
  </>;
}

export default App;