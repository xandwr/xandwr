// Structured resume data.
//
// Every entry carries `tags`, and individual bullets may carry their own tags.
// Presets (see ./resume-presets.ts) use these tags to derive a compact,
// job-tailored version of the resume: relevant entries keep their relevant
// bullets, while non-matching entries collapse to a one-line stub so the
// employment timeline stays gap-free.

/**
 * The closed tag vocabulary. Add new tags here so a typo (e.g. "embeded")
 * is a compile error rather than a silently-ignored tag. Presets in
 * ./resume-presets.ts draw from this same set.
 */
export type Tag =
	| "general"
	| "software"
	| "backend"
	| "frontend"
	| "embedded"
	| "firmware"
	| "hardware"
	| "agile"
	| "teamwork"
	| "games"
	| "it-support"
	| "infrastructure"
	| "customer-service"
	| "retail"
	| "teaching"
	| "mentoring"
	| "content"
	| "media"
	| "marketing"
	| "leadership";

/** A bullet is either plain text (untagged) or text with its own tags. */
export type Bullet = string | { text: string; tags: Tag[] };

export type ResumeEntry = {
	title: string;
	org: string;
	location?: string;
	dates: string;
	/** What kind of work this entry represents; matched against presets. */
	tags: Tag[];
	bullets: Bullet[];
	/**
	 * Optional citations for this entry: a repo, live demo, or writeup. Rendered
	 * as hyperlinks on the web resume and as raw URLs under the entry in print
	 * (and in the markdown/JSON projections). Only shown on expanded entries.
	 */
	links?: { label: string; href: string }[];
};

export type ResumeSection = {
	heading: string;
	entries: ResumeEntry[];
};

export type Resume = {
	name: string;
	headline: string;
	location: string;
	email: string;
	phone: string;
	links: { label: string; href: string }[];
	about: string;
	sections: ResumeSection[];
};

/** Normalizes a Bullet to its `{ text, tags }` object form. */
export function bulletParts(bullet: Bullet): { text: string; tags: Tag[] } {
	return typeof bullet === "string" ? { text: bullet, tags: [] } : bullet;
}

export const resume: Resume = {
	name: "(ale)xander pickering",
	headline: "Computer Science Student & Developer",
	location: "Edmonton, AB",
	email: "ajamespickering@gmail.com",
	phone: "",
	links: [
		{
			label: "linkedin.com/in/alexjpickering",
			href: "https://linkedin.com/in/alexjpickering",
		},
	],
	about:
		"Computer Science major with Business Management at MacEwan University, bringing over a decade of hands-on development experience. A passionate software developer with a hunger to learn and a strong foundation in both software design and business strategy.",
	sections: [
		{
			heading: "Education",
			entries: [
				{
					title: "Computer Science Bachelor's Degree",
					org: "MacEwan University",
					location: "Edmonton, AB",
					dates: "Expected Graduation 2027",
					tags: ["software", "teamwork", "agile"],
					bullets: [
						{
							text: "Introduction to Software Engineering: collaborated with three other developers to build an Android employee scheduling application while studying team-driven development and Agile/Scrum methodologies.",
							tags: ["software", "agile", "teamwork"],
						},
						{
							text: "Introduction to Game Design: collaborated with three other developers to create a fully-functional, 4K rhythm game in Godot.",
							tags: ["software", "games", "teamwork"],
						},
						{
							text: "Programming Methodologies: collaborated with another developer to build a text-based action-adventure RPG using C and ncurses.",
							tags: ["software", "backend", "teamwork"],
						},
					],
				},
				{
					title: "Diploma (with honors)",
					org: "Ross Sheppard High School",
					location: "Edmonton, AB",
					dates: "Graduated June 2021",
					tags: ["general"],
					bullets: [
						"Maintained a steady, above-average GPA to graduate with the honors distinction in the class of 2021.",
						{
							text: "Wrote zip-nukes on the school network, got caught, cited StackOverflow + a VBA forum.",
							tags: ["software"],
						},
					],
				},
			],
		},
		{
			heading: "Employment Experience",
			entries: [
				{
					title: "Desktop Support Specialist",
					org: "Alberta Pensions Services Corporation",
					location: "Edmonton, AB",
					dates: "May 2026 – Present (expected August 2026)",
					tags: ["it-support", "infrastructure", "customer-service", "teamwork"],
					bullets: [
						{
							text: "Operated the service desk alongside a team of support specialists, taking phone calls and rapidly closing tickets/incident reports to keep up the pace of org-level activities and ensure every employee had a usable work environment.",
							tags: ["it-support", "customer-service", "teamwork"],
						},
						{
							text: "Worked fully on-site daily, handling on-the-go hardware tasks: provisioning new workstations, PXE-booting enterprise Windows onto evergreened corporate machines, and maintaining human-first client relations.",
							tags: ["it-support", "hardware", "customer-service"],
						},
						{
							text: "Managed internal inventory auditing and compliance/regulatory concerns during downtime.",
							tags: ["it-support"],
						},
						{
							text: "Learned enterprise backend infrastructure hands-on: Active Directory, Azure + federated ID, privileged identity management, internal payroll software, printer networks, SCCM, and ServiceNow.",
							tags: ["it-support", "infrastructure"],
						},
					],
				},
				{
					title: "Code Sensei",
					org: "Code Ninjas",
					location: "Edmonton, AB",
					dates: "September 2024 – October 2024",
					tags: ["teaching", "mentoring", "software"],
					bullets: [
						{
							text: "Instructed students aged 8–11 in coding fundamentals through interactive sessions using Minecraft and Roblox.",
							tags: ["teaching", "software"],
						},
						{
							text: "Guided students in creating and modifying their own games and virtual worlds, fostering creativity and practical application of coding skills.",
							tags: ["teaching", "mentoring"],
						},
						{
							text: "Taught basic programming concepts in an engaging environment tailored for younger learners.",
							tags: ["teaching", "software"],
						},
					],
				},
				{
					title: "Content Coordinator & Strategist",
					org: "Stony Plain Road Business Association",
					location: "Edmonton, AB",
					dates: "May 2024 – August 2024",
					tags: ["content", "marketing", "media", "leadership"],
					bullets: [
						{
							text: "Developed and executed social media content strategies, increasing organic engagement by over 200%.",
							tags: ["content", "marketing"],
						},
						{
							text: "Managed the association's accounts: scheduling posts and engaging the community to enhance brand visibility.",
							tags: ["content", "marketing", "leadership"],
						},
						{
							text: "Conducted in-person interviews with local businesses to drive traffic and give owners their own voice.",
							tags: ["content", "media"],
						},
						{
							text: "Edited video and photo for social media campaigns, including the interviews above.",
							tags: ["media", "content"],
						},
					],
				},
				{
					title: "YouTube Content Creator",
					org: "YouTube",
					location: "Edmonton, AB",
					dates: "October 2019 – April 2023",
					tags: ["content", "media", "marketing"],
					bullets: [
						{
							text: "Grew a channel of over 19.5K subscribers through strategic content planning, SEO, and engaging video production.",
							tags: ["content", "marketing"],
						},
						{
							text: "Generated over $6,000 in revenue via ad revenue and affiliate marketing.",
							tags: ["marketing"],
						},
						{
							text: "Designed, edited, and produced content using DaVinci Resolve and Adobe Premiere Pro that consistently exceeded viewership expectations.",
							tags: ["media", "content"],
						},
					],
				},
				{
					title: "Sales Associate",
					org: "Canadian Tire",
					location: "Edmonton, AB",
					dates: "August 2019 – June 2021",
					tags: ["customer-service", "retail", "teamwork"],
					bullets: [
						"Kept the store well-stocked by restocking shelves and facing aisles regularly so customers always had access to the products they needed.",
						{
							text: "Collaborated with team members to keep stock palettes and carts organized and accessible.",
							tags: ["teamwork"],
						},
						{
							text: "Used strong product knowledge and customer service skills to help customers find the products that best suited their needs.",
							tags: ["customer-service"],
						},
					],
				},
			],
		},
		{
			heading: "Projects",
			entries: [
				{
					title: "Hardware-Integrated Vehicle Telemetry (University Capstone)",
					org: "MacEwan University",
					dates: "2025",
					tags: ["embedded", "hardware", "firmware", "software"],
					bullets: [
						{
							text: "Designed and implemented a hardware-software bridge between a 2011 VW Jetta dash cluster and the BeamNG.drive simulation platform.",
							tags: ["embedded", "hardware", "software"],
						},
						{
							text: "Engineered a real-time telemetry interface using custom firmware and microcontroller integration to mirror in-game vehicle data onto physical automotive hardware.",
							tags: ["embedded", "firmware", "hardware"],
						},
						{
							text: "Achieved millisecond-level latency and seamless synchronization between digital and analog systems for an immersive physical driving experience.",
							tags: ["embedded", "software"],
						},
						{
							text: "Demonstrated practical application of embedded systems, CAN bus communication, and real-time signal processing.",
							tags: ["embedded", "hardware", "firmware"],
						},
						"Recognized as one of the top capstones in the department for its innovation and technical complexity.",
					],
				},
				{
					title: "ChatGPT-powered TI-84 Calculator",
					org: "Personal Project",
					dates: "2026",
					tags: ["embedded", "hardware", "firmware", "software", "backend"],
					links: [
						{
							label: "github.com/xandwr/GPTi84-Plus",
							href: "https://github.com/xandwr/GPTi84-Plus",
						},
					],
					bullets: [
						{
							text: "Soldered a Pico W wireless mainboard to a headphone cable to bridge a TI-84 to a remote server.",
							tags: ["embedded", "hardware"],
						},
						{
							text: "Engineered a real-time interface with custom firmware to mirror calculator state to the server bidirectionally.",
							tags: ["embedded", "firmware", "backend"],
						},
						{
							text: "Implemented a custom wire protocol (bit-banging the DBUS of the 2.5mm aux port) with negligible transport time, keeping responses on pace with the web version of GPT.",
							tags: ["embedded", "firmware", "software"],
						},
						"Scored 83% on a mock pure-mathematics exam; roasted my mom's cooking when prompted.",
					],
				},
			],
		},
		{
			heading: "Community & Volunteer Leadership",
			entries: [
				{
					title: "App Help Desk Associate",
					org: "Festival of Trees",
					location: "Nisku, AB",
					dates: "November 2018 – December 2018",
					tags: ["it-support", "customer-service"],
					bullets: [
						{
							text: "Staffed a technology help desk, assisting festival visitors with the proprietary software used for the event.",
							tags: ["it-support", "customer-service"],
						},
						{
							text: "Provided technical support and troubleshooting for software-related issues.",
							tags: ["it-support"],
						},
						"Assisted visitors with information on upcoming events and donation options.",
					],
				},
				{
					title: "Tutor",
					org: "Independent",
					location: "Edmonton, AB",
					dates: "January 2018 – March 2020",
					tags: ["teaching", "mentoring"],
					bullets: [
						{
							text: "Tutored children aged 8–12 in English, Math, and Science.",
							tags: ["teaching"],
						},
						{
							text: "Built custom study plans with parents to help kids reach their academic goals.",
							tags: ["teaching", "mentoring"],
						},
					],
				},
			],
		},
	],
};
