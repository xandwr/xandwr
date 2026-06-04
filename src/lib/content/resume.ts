// Structured resume data

export type ResumeEntry = {
	title: string;
	org: string;
	location?: string;
	dates: string;
	bullets: string[];
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

export const resume: Resume = {
	name: "Xander Pickering",
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
		"Computer Science major with a Business Management and Physics double minor at MacEwan University, bringing over five years of hands-on development experience. Passionate software developer with a lifelong commitment to learning and a strong foundation in both software design and business strategy.",
	sections: [
		{
			heading: "Education",
			entries: [
				{
					title: "Computer Science Bachelor's Degree",
					org: "MacEwan University",
					location: "Edmonton, AB",
					dates: "Expected Graduation 2027",
					bullets: [
						"Introduction to Software Engineering: collaborated with three other developers to build an Android employee scheduling application while studying team-driven development and Agile/Scrum methodologies.",
						"Introduction to Game Design: collaborated with three other developers to create a fully-functional, 4K rhythm game in Godot.",
						"Programming Methodologies: collaborated with another developer to build a text-based action-adventure RPG using C and ncurses.",
					],
				},
				{
					title: "Diploma (with honors)",
					org: "Ross Sheppard High School",
					location: "Edmonton, AB",
					dates: "Graduated June 2021",
					bullets: [
						"Maintained a steady, above-average GPA to graduate with the honors distinction in the class of 2021.",
						"Wrote zip-nukes on the school network, got caught, cited StackOverflow + a VBA forum.",
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
					bullets: [
						"Operated the service desk alongside a team of support specialists, taking phone calls and rapidly closing tickets/incident reports to keep up the pace of org-level activities and ensure every employee had a usable work environment.",
						"Worked fully on-site daily, handling on-the-go hardware tasks: provisioning new workstations, PXE-booting enterprise Windows onto evergreened corporate machines, and maintaining human-first client relations.",
						"Managed internal inventory auditing and compliance/regulatory concerns during downtime.",
						"Learned enterprise backend infrastructure hands-on: Active Directory, Azure + federated ID, privileged identity management, internal payroll software, printer networks, SCCM, and ServiceNow.",
					],
				},
				{
					title: "Code Sensei",
					org: "Code Ninjas",
					location: "Edmonton, AB",
					dates: "September 2024 – October 2024",
					bullets: [
						"Instructed students aged 8–11 in coding fundamentals through interactive sessions using Minecraft and Roblox.",
						"Guided students in creating and modifying their own games and virtual worlds, fostering creativity and practical application of coding skills.",
						"Taught basic programming concepts in an engaging environment tailored for younger learners.",
					],
				},
				{
					title: "Content Coordinator & Strategist",
					org: "Stony Plain Road Business Association",
					location: "Edmonton, AB",
					dates: "May 2024 – August 2024",
					bullets: [
						"Developed and executed social media content strategies, increasing organic engagement by over 200%.",
						"Managed the association's accounts — scheduling posts and engaging the community to enhance brand visibility.",
						"Conducted in-person interviews with local businesses to drive traffic and give owners their own voice.",
						"Edited video and photo for social media campaigns, including the interviews above.",
					],
				},
				{
					title: "YouTube Content Creator",
					org: "YouTube",
					location: "Edmonton, AB",
					dates: "October 2019 – April 2023",
					bullets: [
						"Grew a channel of over 19.5K subscribers through strategic content planning, SEO, and engaging video production.",
						"Generated over $6,000 in revenue via ad revenue and affiliate marketing.",
						"Designed, edited, and produced content using DaVinci Resolve and Adobe Premiere Pro that consistently exceeded viewership expectations.",
					],
				},
				{
					title: "Sales Associate",
					org: "Canadian Tire",
					location: "Edmonton, AB",
					dates: "August 2019 – June 2021",
					bullets: [
						"Kept the store well-stocked by restocking shelves and facing aisles regularly so customers always had access to the products they needed.",
						"Collaborated with team members to keep stock palettes and carts organized and accessible.",
						"Used strong product knowledge and customer service skills to help customers find the products that best suited their needs.",
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
					bullets: [
						"Designed and implemented a hardware-software bridge between a 2011 VW Jetta dash cluster and the BeamNG.drive simulation platform.",
						"Engineered a real-time telemetry interface using custom firmware and microcontroller integration to mirror in-game vehicle data onto physical automotive hardware.",
						"Achieved millisecond-level latency and seamless synchronization between digital and analog systems for an immersive physical driving experience.",
						"Demonstrated practical application of embedded systems, CAN bus communication, and real-time signal processing.",
						"Recognized as one of the top capstones in the department for its innovation and technical complexity.",
					],
				},
				{
					title: "ChatGPT-powered TI-84 Calculator",
					org: "Personal Project",
					dates: "2026",
					bullets: [
						"Soldered a Pico W wireless mainboard to a headphone cable to bridge a TI-84 to a remote server.",
						"Engineered a real-time interface with custom firmware to mirror calculator state to the server bidirectionally.",
						"Implemented a custom wire protocol (bit-banging the DBUS of the 2.5mm aux port) with negligible transport time, keeping responses on pace with the web version of GPT.",
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
					bullets: [
						"Staffed a technology help desk, assisting festival visitors with the proprietary software used for the event.",
						"Provided technical support and troubleshooting for software-related issues.",
						"Assisted visitors with information on upcoming events and donation options.",
					],
				},
				{
					title: "Tutor",
					org: "Independent",
					location: "Edmonton, AB",
					dates: "January 2018 – March 2020",
					bullets: [
						"Tutored children aged 8–12 in English, Math, and Science.",
						"Built custom study plans with parents to help kids reach their academic goals.",
					],
				},
			],
		},
	],
};
