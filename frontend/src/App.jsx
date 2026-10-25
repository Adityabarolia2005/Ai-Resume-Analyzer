import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "./api.js";

const emptyProject = { projectName: "", description: "" };
const emptyTask = { taskTitle: "", taskDescription: "", taskAttachments: [] };

function App() {
    const resetToken = new URLSearchParams(window.location.search).get("token");
    const isResetPage = window.location.pathname === "/reset-password";
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("bootcampUser") || "null"));

    if (!user) {
        return isResetPage ? <ResetPassword token={resetToken} /> : <AuthScreen onLogin={setUser} />;
    }

    return <Dashboard user={user} onLogout={() => {
        setUser(null);
        localStorage.removeItem("bootcampUser");
    }} />;
}

function AuthScreen({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ email: "", password: "", userName: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function update(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function submit(event) {
        event.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            if (mode === "register") {
                await apiRequest("/auth/register", {
                    method: "POST",
                    body: JSON.stringify(form)
                });
                setMessage("Account created. Verify your email, then log in.");
                setMode("login");
            } else {
                const result = await apiRequest("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ email: form.email, password: form.password })
                });
                const loggedInUser = result.data;
                localStorage.setItem("bootcampUser", JSON.stringify(loggedInUser));
                onLogin(loggedInUser);
            }
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
            <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div>
                    <div className="mb-20 flex items-center gap-3 text-lg font-bold">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500">B</span>
                        Bootcamp OS
                    </div>
                    <p className="eyebrow !text-indigo-300">Team learning, organized</p>
                    <h1 className="mt-5 max-w-xl text-5xl font-bold leading-tight">Turn every assignment into visible progress.</h1>
                    <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">Projects, people and tasks in one calm workspace built for focused bootcamp teams.</p>
                </div>
                <p className="text-sm text-slate-400">Plan clearly. Work together. Ship consistently.</p>
            </section>
            <section className="flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-10 lg:hidden">
                        <p className="text-lg font-bold">Bootcamp OS</p>
                    </div>
                    <p className="eyebrow">Welcome back</p>
                    <h2 className="mt-2 text-3xl font-bold">{mode === "login" ? "Sign in to your workspace" : "Create your workspace account"}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">Use the same account for projects, members and assigned tasks.</p>
                    <form onSubmit={submit} className="mt-8 space-y-4">
                        {mode === "register" && <input className="input" name="userName" placeholder="Username" value={form.userName} onChange={update} required />}
                        <input className="input" name="email" type="email" placeholder="Email address" value={form.email} onChange={update} required />
                        <input className="input" name="password" type="password" placeholder="Password" value={form.password} onChange={update} required minLength={8} />
                        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                        {message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
                        <button className="button-primary w-full" disabled={loading}>{loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}</button>
                    </form>
                    <div className="mt-6 flex items-center justify-between text-sm">
                        <button className="font-semibold text-brand-600" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Already have an account?"}</button>
                        {mode === "login" && <a className="text-slate-500 hover:text-brand-600" href="/forgot-password">Forgot password?</a>}
                    </div>
                    {mode === "login" && <p className="mt-10 text-center text-xs text-slate-400">Email verification is required before login.</p>}
                </div>
            </section>
        </main>
    );
}

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function submit(event) {
        event.preventDefault();
        setError("");
        try {
            const result = await apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
            setMessage(result.message);
        } catch (submitError) {
            setError(submitError.message);
        }
    }

    return <SimpleAuthCard title="Reset your password" subtitle="Enter your account email and we will send a secure reset link.">
        <form onSubmit={submit} className="space-y-4">
            <input className="input" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
            <button className="button-primary w-full">Send reset link</button>
            <a className="block text-center text-sm font-semibold text-brand-600" href="/">Back to login</a>
        </form>
    </SimpleAuthCard>;
}

function ResetPassword({ token }) {
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function submit(event) {
        event.preventDefault();
        setError("");
        try {
            const result = await apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword: password }) });
            setMessage(result.message);
        } catch (submitError) {
            setError(submitError.message);
        }
    }

    return <SimpleAuthCard title="Choose a new password" subtitle="Your reset link is valid for 15 minutes.">
        <form onSubmit={submit} className="space-y-4">
            <input className="input" type="password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
            <button className="button-primary w-full">Update password</button>
            <a className="block text-center text-sm font-semibold text-brand-600" href="/">Back to login</a>
        </form>
    </SimpleAuthCard>;
}

function SimpleAuthCard({ title, subtitle, children }) {
    return <main className="grid min-h-screen place-items-center p-6"><div className="panel w-full max-w-md p-8"><p className="eyebrow">Bootcamp OS</p><h1 className="mt-3 text-3xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p><div className="mt-8">{children}</div></div></main>;
}

function Dashboard({ user, onLogout }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [projectForm, setProjectForm] = useState(emptyProject);
    const [taskForm, setTaskForm] = useState(emptyTask);
    const [memberForm, setMemberForm] = useState({ userId: "", role: "member" });
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    const isAdmin = user.globalRole === "admin";

    async function loadAssignedTasks() {
        try {
            const result = await apiRequest("/project/tasks/assigned");
            setAssignedTasks(result.data || []);
        } catch (loadError) {
            setError(loadError.message);
        }
    }

    async function loadProjects() {
        try {
            const result = await apiRequest("/project");
            setProjects(result.data || []);
        } catch (loadError) {
            setError(loadError.message);
        }
    }

    async function loadProject(project) {
        setSelectedProject(project);
        setError("");
        try {
            const [memberResult, taskResult] = await Promise.all([
                apiRequest(`/projectMember/${project._id}/members`),
                apiRequest(`/project/${project._id}/tasks`)
            ]);
            setMembers(memberResult.data || []);
            setTasks(taskResult.data || []);
        } catch (loadError) {
            setError(loadError.message);
        }
    }

    useEffect(() => {
        loadProjects();
        loadAssignedTasks();
    }, []);

    async function createProject(event) {
        event.preventDefault();
        try {
            await apiRequest("/project/createProject", { method: "POST", body: JSON.stringify(projectForm) });
            setProjectForm(emptyProject);
            setNotice("Project created");
            await loadProjects();
        } catch (submitError) {
            setError(submitError.message);
        }
    }

    async function createTask(event) {
        event.preventDefault();
        try {
            await apiRequest(`/project/${selectedProject._id}/tasks`, { method: "POST", body: JSON.stringify(taskForm) });
            setTaskForm(emptyTask);
            setNotice("Task created");
            await loadProject(selectedProject);
        } catch (submitError) {
            setError(submitError.message);
        }
    }

    async function addMember(event) {
        event.preventDefault();
        try {
            await apiRequest(`/projectMember/${selectedProject._id}/members`, { method: "POST", body: JSON.stringify(memberForm) });
            setMemberForm({ userId: "", role: "member" });
            setNotice("Member added");
            await loadProject(selectedProject);
        } catch (submitError) {
            setError(submitError.message);
        }
    }

    async function assignTask(taskId, userId) {
        try {
            await apiRequest(`/project/${selectedProject._id}/tasks/${taskId}/assign`, { method: "PATCH", body: JSON.stringify({ userId }) });
            setNotice("Task assigned");
            await loadProject(selectedProject);
            await loadAssignedTasks();
        } catch (submitError) {
            setError(submitError.message);
        }
    }

    async function changeStatus(projectId, taskId, newStatus) {
        try {
            await apiRequest(`/project/${projectId}/task/${taskId}/status`, { method: "PATCH", body: JSON.stringify({ newStatus }) });
            setNotice("Task status updated");
            await loadAssignedTasks();
            if (selectedProject?._id === projectId) await loadProject(selectedProject);
        } catch (submitError) {
            setError(submitError.message);
        }
    }

    async function logout() {
        try { await apiRequest("/auth/logout", { method: "GET" }); } finally { onLogout(); }
    }

    return <div className="min-h-screen">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
                <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-bold text-white">B</span><span className="font-bold">Bootcamp OS</span></div>
                <div className="flex items-center gap-4"><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.userName}</p><p className="text-xs text-slate-500">{user.email}</p></div><button className="button-secondary" onClick={logout}>Log out</button></div>
            </div>
        </header>
        <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[280px_1fr] lg:px-8">
            <aside className="space-y-5">
                <div><p className="eyebrow">Workspace</p><h1 className="mt-2 text-2xl font-bold">Your projects</h1></div>
                <form onSubmit={createProject} className="panel space-y-3 p-4"><input className="input" placeholder="Project name" value={projectForm.projectName} onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })} required /><textarea className="input min-h-20 resize-none" placeholder="Short description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} /><button className="button-primary w-full">New project</button></form>
                <div className="space-y-2">{projects.map((project) => <button key={project._id} onClick={() => loadProject(project)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedProject?._id === project._id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}><p className="font-semibold">{project.name}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{project.description}</p></button>)}{projects.length === 0 && <p className="text-sm text-slate-500">Create your first project.</p>}</div>
            </aside>
            <section className="space-y-6">
                {(notice || error) && <div className={`rounded-xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || notice}<button className="float-right font-bold" onClick={() => { setError(""); setNotice(""); }}>×</button></div>}
                <div className="grid gap-4 sm:grid-cols-3"><Stat label="Projects" value={projects.length} /><Stat label="Assigned to you" value={assignedTasks.length} /><Stat label="Open tasks" value={assignedTasks.filter((task) => task.status !== "done").length} /></div>
                <div className="panel p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Personal queue</p><h2 className="mt-1 text-xl font-bold">Tasks assigned to you</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{assignedTasks.length} total</span></div><div className="mt-5 grid gap-3 md:grid-cols-2">{assignedTasks.map((task) => <TaskCard key={task._id} task={task} canChangeStatus onStatusChange={changeStatus} />)}{assignedTasks.length === 0 && <Empty text="No tasks assigned to you yet." />}</div></div>
                {selectedProject ? <ProjectWorkspace project={selectedProject} members={members} tasks={tasks} taskForm={taskForm} setTaskForm={setTaskForm} memberForm={memberForm} setMemberForm={setMemberForm} createTask={createTask} addMember={addMember} assignTask={assignTask} changeStatus={changeStatus} isAdmin={isAdmin} /> : <div className="panel flex min-h-64 items-center justify-center p-8 text-center"><div><p className="text-4xl">✦</p><h2 className="mt-3 text-xl font-bold">Select a project</h2><p className="mt-2 text-sm text-slate-500">Choose a project from the left to manage its team and tasks.</p></div></div>}
            </section>
        </main>
    </div>;
}

function ProjectWorkspace({ project, members, tasks, taskForm, setTaskForm, memberForm, setMemberForm, createTask, addMember, assignTask, changeStatus }) {
    return <div className="space-y-6"><div><p className="eyebrow">Project workspace</p><h2 className="mt-1 text-3xl font-bold">{project.name}</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">{project.description}</p></div><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><div className="panel p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Delivery board</p><h3 className="mt-1 text-xl font-bold">Project tasks</h3></div><span className="text-sm text-slate-500">{tasks.length} tasks</span></div><div className="mt-5 space-y-3">{tasks.map((task) => <TaskCard key={task._id} task={task} members={members} canAssign onAssign={assignTask} canChangeStatus onStatusChange={changeStatus} />)}{tasks.length === 0 && <Empty text="No tasks in this project yet." />}</div></div><div className="space-y-6"><form onSubmit={createTask} className="panel space-y-3 p-6"><div><p className="eyebrow">Create</p><h3 className="mt-1 text-xl font-bold">Add a task</h3></div><input className="input" placeholder="Task title" value={taskForm.taskTitle} onChange={(e) => setTaskForm({ ...taskForm, taskTitle: e.target.value })} required /><textarea className="input min-h-24 resize-none" placeholder="Describe the outcome" value={taskForm.taskDescription} onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })} required /><button className="button-primary w-full">Create task</button></form><form onSubmit={addMember} className="panel space-y-3 p-6"><div><p className="eyebrow">Team</p><h3 className="mt-1 text-xl font-bold">Add a member</h3></div><input className="input" placeholder="User ID" value={memberForm.userId} onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })} required /><select className="input" value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}><option value="member">Member</option><option value="project_admin">Project admin</option></select><button className="button-secondary w-full">Add member</button></form><div className="panel p-6"><p className="eyebrow">Team directory</p><div className="mt-4 space-y-3">{members.map((member) => <div key={member._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="text-sm font-semibold">{member.userId?.userName || "Unknown user"}</p><p className="text-xs text-slate-500">{member.userId?.email || member.userId?._id}</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">{member.role}</span></div>)}{members.length === 0 && <Empty text="No members added." />}</div></div></div></div></div>;
}

function TaskCard({ task, members = [], canAssign, onAssign, canChangeStatus, onStatusChange }) {
    const projectId = task.project?._id || task.project;
    const assignedId = task.assignedTo?._id || task.assignedTo || "";
    return <article className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-semibold">{task.title}</h4><p className="mt-1 text-sm leading-6 text-slate-500">{task.description}</p></div><StatusBadge status={task.status} /></div><div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">{task.project?.name && <span className="rounded-full bg-slate-100 px-2.5 py-1">{task.project.name}</span>}<span>Assigned: {task.assignedTo?.userName || "Unassigned"}</span></div>{canAssign && <div className="mt-4 flex gap-2"><select className="input py-2 text-xs" value={assignedId} onChange={(e) => e.target.value && onAssign(task._id, e.target.value)}><option value="">Assign to...</option>{members.map((member) => <option key={member.userId?._id || member.userId} value={member.userId?._id || member.userId}>{member.userId?.userName || "Member"}</option>)}</select></div>}{canChangeStatus && <select className="input mt-3 py-2 text-xs" value={task.status} onChange={(e) => onStatusChange(projectId, task._id, e.target.value)}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select>}</article>;
}

function StatusBadge({ status }) { const labels = { todo: "To do", in_progress: "In progress", done: "Done" }; return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${status === "done" ? "bg-emerald-100 text-emerald-700" : status === "in_progress" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>{labels[status] || status}</span>; }
function Stat({ label, value }) { return <div className="panel p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>; }
function Empty({ text }) { return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{text}</p>; }

function LegacyRootApp() {
    if (window.location.pathname === "/forgot-password") return <ForgotPassword />;
    return <App />;
}

export { default } from "./ResumeAnalyzer.jsx";
