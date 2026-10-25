const skillDictionary = ["React", "JavaScript", "TypeScript", "Node.js", "Express", "Python", "Java", "SQL", "MongoDB", "PostgreSQL", "AWS", "Docker", "Git", "GitHub", "Figma", "Jest", "REST API", "GraphQL"];

function localAnalysis(text) {
    const normalized = text.toLowerCase();
    const skills = skillDictionary.filter((skill) => normalized.includes(skill.toLowerCase()));
    const hasContact = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text);
    const hasExperience = /experience|developer|engineer|intern/i.test(text);
    const hasMetrics = /\d+\s?[%+]?|increased|reduced|improved|saved|grew/i.test(text);
    const sections = ["summary", "experience", "projects", "education"].filter((item) => normalized.includes(item)).length;
    const score = Math.min(98, 36 + skills.length * 4 + (hasContact ? 8 : 0) + (hasExperience ? 12 : 0) + (hasMetrics ? 9 : 0) + sections * 3);
    return {
        score,
        skills,
        summary: score >= 80 ? "Strong foundation with clear technical signals." : "Good starting point with a few high-impact improvements available.",
        recommendations: [
            !hasMetrics && "Add measurable outcomes to your experience bullets.",
            skills.length < 6 && "Match a few keywords from the target job description.",
            !hasContact && "Add a professional email and LinkedIn URL near your name."
        ].filter(Boolean)
    };
}

export async function analyzeResume(req, res, next) {
    try {
        const { resumeText, jobDescription = "" } = req.body;
        if (!resumeText || resumeText.trim().length < 40) {
            return res.status(400).json({ success: false, message: "resumeText must contain at least 40 characters." });
        }

        const fallback = localAnalysis(resumeText);
        if (!process.env.OPENAI_API_KEY) {
            return res.json({ success: true, source: "local-fallback", data: fallback });
        }

        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
                input: [
                    { role: "system", content: "You are a practical ATS resume reviewer. Return concise, honest feedback in JSON." },
                    { role: "user", content: `Resume:\n${resumeText}\n\nTarget job description (optional):\n${jobDescription}` }
                ],
                text: { format: { type: "json_schema", name: "resume_review", strict: true, schema: { type: "object", properties: { score: { type: "number" }, summary: { type: "string" }, skills: { type: "array", items: { type: "string" } }, recommendations: { type: "array", items: { type: "string" } } }, required: ["score", "summary", "skills", "recommendations"], additionalProperties: false } } }
            })
        });
        if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}`);
        const payload = await response.json();
        return res.json({ success: true, source: "openai", data: JSON.parse(payload.output_text) });
    } catch (error) {
        return next(error);
    }
}
