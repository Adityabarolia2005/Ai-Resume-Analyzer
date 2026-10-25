import { useMemo, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const skillGroups = {
    Frontend: ["react", "javascript", "typescript", "html", "css", "tailwind", "next.js", "redux"],
    Backend: ["node.js", "node", "express", "python", "java", "rest api", "graphql", "mongodb", "sql", "postgresql"],
    Tools: ["git", "github", "docker", "aws", "figma", "jest", "postman", "agile", "scrum"]
};

const sampleResume = `Aarav Mehta
Frontend Developer

aarav.mehta@email.com | Bengaluru, India

SUMMARY
Frontend developer with 2 years of experience building responsive web applications and clean user experiences.

EXPERIENCE
Frontend Developer — Pixel Labs | 2023 - Present
• Built React and JavaScript dashboards used by 10,000+ customers.
• Improved page speed by 35% using code splitting and lazy loading.
• Worked with Node.js APIs, Git, Figma and Agile teams.

PROJECTS
ResumeIQ — React, Node.js, Express, MongoDB
• Created an AI resume analyzer with ATS scoring and skill extraction.

EDUCATION
B.Tech in Computer Science, 2023`;

function analyzeResume(text) {
    const normalized = text.toLowerCase();
    const detectedSkills = Object.entries(skillGroups).flatMap(([group, skills]) => skills
        .filter((skill) => normalized.includes(skill.toLowerCase()))
        .map((skill) => ({ skill: skill === "node" ? "Node.js" : skill.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()), group })));
    const skills = [...new Map(detectedSkills.map((item) => [item.skill, item])).values()];
    const hasContact = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text);
    const hasExperience = /experience|work history|developer|engineer|intern/i.test(text);
    const hasEducation = /education|university|bachelor|degree|b\.tech|college/i.test(text);
    const hasMetrics = /\d+\s?[%+]?|increased|reduced|improved|saved|grew/i.test(text);
    const sections = ["summary", "experience", "projects", "education"].filter((section) => normalized.includes(section)).length;
    const score = Math.min(98, 36 + skills.length * 4 + (hasContact ? 8 : 0) + (hasExperience ? 12 : 0) + (hasEducation ? 8 : 0) + (hasMetrics ? 9 : 0) + sections * 3);
    const gaps = [
        !hasMetrics && "Add measurable impact to your experience bullets (numbers, percentages, time, or scale).",
        skills.length < 6 && "Mirror 2–3 relevant keywords from the target job description.",
        !hasContact && "Add a professional email and LinkedIn URL near your name.",
        !sections && "Use clear ATS-friendly headings such as Summary, Experience, Projects, and Education."
    ].filter(Boolean);
    return {
        score,
        label: score >= 80 ? "Strong match" : score >= 65 ? "Good foundation" : "Needs a polish",
        skills,
        stats: { skills: skills.length, sections, metrics: hasMetrics ? 1 : 0, words: text.trim().split(/\s+/).filter(Boolean).length },
        strengths: [hasContact && "Contact details are easy to find.", hasExperience && "Your experience section gives the reviewer context.", hasMetrics && "You use measurable outcomes in your bullets.", skills.length >= 6 && "Your technical toolkit is clear."].filter(Boolean),
        gaps
    };
}

function App() {
    const [resumeText, setResumeText] = useState("");
    const [fileName, setFileName] = useState("");
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const fileInput = useRef(null);
    const groupedSkills = useMemo(() => result?.skills.reduce((groups, item) => ({ ...groups, [item.group]: [...(groups[item.group] || []), item.skill] }), {}) || {}, [result]);

    function handleFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        setError("");
        setFileName(file.name);
        if (!/\.(txt|md)$/i.test(file.name)) {
            setError("For this basic version, upload a .txt or .md file, or paste your resume below.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setResumeText(String(reader.result || ""));
        reader.readAsText(file);
    }

    async function runAnalysis() {
        if (resumeText.trim().length < 40) {
            setError("Add a little more resume content so the analyzer can give useful feedback.");
            return;
        }
        setError("");
        setIsAnalyzing(true);
        await new Promise((resolve) => setTimeout(resolve, 350));
        const localResult = analyzeResume(resumeText);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1200);
            const response = await fetch(`${API_URL}/resume/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeText }), signal: controller.signal });
            clearTimeout(timeout);
            if (response.ok) {
                const payload = await response.json();
                const ai = payload.data;
                if (ai) {
                    const aiSkills = (ai.skills || []).map((skill) => ({ skill, group: Object.entries(skillGroups).find(([, list]) => list.some((item) => item.toLowerCase() === skill.toLowerCase()))?.[0] || "Tools" }));
                    setResult({ ...localResult, ...ai, skills: aiSkills, label: ai.score >= 80 ? "Strong match" : ai.score >= 65 ? "Good foundation" : "Needs a polish", gaps: ai.recommendations || localResult.gaps, strengths: ai.summary ? [ai.summary] : localResult.strengths, stats: { ...localResult.stats, skills: aiSkills.length } });
                } else setResult(localResult);
            } else setResult(localResult);
        } catch { setResult(localResult); }
        setActiveTab("overview");
        setIsAnalyzing(false);
    }

    function loadSample() {
        setResumeText(sampleResume);
        setFileName("aarav-mehta-resume.txt");
        setError("");
        setResult(null);
    }

    return <div className="app-shell">
        <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">R</span><span>Resume<span className="brand-accent">IQ</span></span></a><nav><a href="#analyze">Analyze</a><a href="#how-it-works">How it works</a><a href="#tips">Resume tips</a></nav><div className="topbar-status"><span className="status-dot" /> AI-powered feedback</div></header>
        <main id="top">
            <section className="hero"><div className="hero-copy"><div className="eyebrow"><span>✦</span> Smart resume feedback</div><h1>Make your resume <em>impossible to ignore.</em></h1><p>Upload your resume and get an instant ATS-style score, skill breakdown, and clear next steps to stand out.</p><div className="hero-proof"><div className="avatar-stack"><span>AM</span><span>SK</span><span>JR</span></div><span>Trusted by <strong>2,000+ job seekers</strong></span><span className="proof-divider" /><span>94% found something to improve</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbital-card"><div className="mini-score"><span>ATS score</span><strong>86</strong><small>/100</small></div><div className="mini-bars"><i /><i /><i /><i /><i /></div><div className="mini-label">↑ Great potential</div></div><div className="floating-chip chip-top">✓ Skills found</div><div className="floating-chip chip-bottom">✦ Personalized tips</div></div></section>
            <section className="workspace" id="analyze"><div className="section-heading"><div><div className="eyebrow">01 / Upload</div><h2>Let’s see what your resume can do.</h2></div><button className="text-button" onClick={loadSample}>Try with a sample resume <span>↗</span></button></div><div className="analyzer-grid"><div className="upload-card"><div className="upload-card-head"><div><h3>Drop your resume here</h3><p>We’ll scan it for ATS readiness and impact.</p></div><span className="file-type">TXT / MD</span></div><button className="dropzone" onClick={() => fileInput.current?.click()}><input ref={fileInput} type="file" accept=".txt,.md" onChange={handleFile} hidden /><span className="upload-icon">↑</span><strong>{fileName || "Choose a file or drag it here"}</strong><small>{fileName ? "File ready — you can edit the text below" : "Basic version supports .txt and .md files"}</small></button><div className="or-line"><span>or paste your resume</span></div><textarea value={resumeText} onChange={(event) => { setResumeText(event.target.value); setFileName(""); }} placeholder="Paste your resume text here..." /><div className="upload-footer"><span>{resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words ready` : "Your content stays private"}</span><button className="primary-button" onClick={runAnalysis} disabled={isAnalyzing}>{isAnalyzing ? "Analyzing..." : "Analyze my resume →"}</button></div>{error && <p className="error-message">{error}</p>}</div><div className="side-note"><div className="note-icon">✦</div><h3>What you’ll get</h3><div className="benefit"><span>01</span><div><strong>ATS compatibility score</strong><p>See how easily hiring systems can read your resume.</p></div></div><div className="benefit"><span>02</span><div><strong>Skills that stand out</strong><p>Know which keywords are helping you get noticed.</p></div></div><div className="benefit"><span>03</span><div><strong>Actionable improvements</strong><p>Simple, specific feedback you can apply today.</p></div></div></div></div></section>
            {result && <section className="results-section" id="results"><div className="section-heading"><div><div className="eyebrow">02 / Your report</div><h2>Here’s how your resume looks.</h2></div><span className="report-ready"><span className="status-dot" /> Analysis complete</span></div><div className="report-grid"><div className="score-card"><div className="score-ring" style={{ "--score": `${result.score * 3.6}deg` }}><div><strong>{result.score}</strong><span>/ 100</span></div></div><p className="score-label">{result.label}</p><small>Based on structure, keywords, impact, and readability</small><div className="score-scale"><span>Needs work</span><span>Strong</span></div></div><div className="report-main"><div className="report-tabs"><button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview</button><button className={activeTab === "skills" ? "active" : ""} onClick={() => setActiveTab("skills")}>Skills found <b>{result.stats.skills}</b></button><button className={activeTab === "improve" ? "active" : ""} onClick={() => setActiveTab("improve")}>Improve <b>{result.gaps.length}</b></button></div>{activeTab === "overview" && <div className="report-content"><div className="metric-row"><Metric label="Skills detected" value={result.stats.skills} suffix="skills" /><Metric label="Resume sections" value={result.stats.sections} suffix="found" /><Metric label="Impact signals" value={result.stats.metrics} suffix="detected" /><Metric label="Word count" value={result.stats.words} suffix="words" /></div><div className="insight-columns"><InsightList title="What’s working" icon="✓" items={result.strengths.length ? result.strengths : ["Your resume has a clear starting point. Keep building on it."]} good /><InsightList title="Your next best moves" icon="→" items={result.gaps.length ? result.gaps : ["Your resume is in great shape. Tailor keywords for each job description."]} /></div></div>}{activeTab === "skills" && <div className="report-content skill-groups">{Object.entries(groupedSkills).map(([group, skills]) => <div className="skill-group" key={group}><div><span className="skill-group-icon">✦</span><strong>{group}</strong></div><div className="skill-pills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>)}{!result.skills.length && <p className="empty-copy">No common skills detected yet. Add a technical skills section to your resume.</p>}</div>}{activeTab === "improve" && <div className="report-content improvement-list">{result.gaps.map((gap, index) => <div className="improvement" key={gap}><span>{String(index + 1).padStart(2, "0")}</span><p>{gap}</p></div>)}</div>}</div></div></section>}
            <section className="how-section" id="how-it-works"><div className="eyebrow">03 / How it works</div><h2>Simple on purpose.</h2><div className="steps"><div><span>01</span><h3>Upload</h3><p>Drop in your resume or paste the text. No account needed for a first look.</p></div><div><span>02</span><h3>Understand</h3><p>ResumeIQ checks structure, skills, clarity, and impact signals like a first-pass ATS.</p></div><div><span>03</span><h3>Improve</h3><p>Use the prioritized feedback to make changes that are easy to explain in an interview.</p></div></div></section>
            <section className="tips-section" id="tips"><div><div className="eyebrow">Quick wins</div><h2>Small edits. Better first impressions.</h2><p>Start with measurable bullets, clear section headings, and keywords from the job description.</p></div><div className="tip-quote"><span>“</span><p>Instead of “worked on a dashboard,” try “built a React dashboard used by 10,000+ customers.”</p></div></section>
        </main><footer><span className="brand"><span className="brand-mark">R</span> Resume<span className="brand-accent">IQ</span></span><span>Built for better first impressions.</span><span>© 2026 ResumeIQ</span></footer>
    </div>;
}

function Metric({ label, value, suffix }) { return <div className="metric"><span>{label}</span><strong>{value} <small>{suffix}</small></strong></div>; }
function InsightList({ title, icon, items, good }) { return <div className={`insight-list ${good ? "good" : ""}`}><h3><span>{icon}</span>{title}</h3>{items.map((item) => <p key={item}><span>{good ? "✓" : "→"}</span>{item}</p>)}</div>; }

export default App;
