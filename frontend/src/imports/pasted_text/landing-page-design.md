Tech stack
You are updating an existing frontend codebase.

Hard constraints:
1) Keep stack exactly as-is: React 19, Vite 8, TypeScript ESM, npm, ESLint flat config.
2) Do NOT convert anything to JavaScript.
3) Keep existing folder/file layout unchanged:
- index.html
- vite.config.ts
- eslint.config.js
- tsconfig.json
- tsconfig.app.json
- tsconfig.node.json
- main.tsx
- App.tsx
- index.css
- App.css
- frontend/public/*
- frontend/src/assets/*
- frontend/src/components/*
- frontend/src/pages/*
- frontend/src/types/*
4) Use functional components and React hooks only.
5) Follow existing naming/style patterns in current files.
6) Do not add new dependencies unless absolutely necessary. If needed, state exact package name, version range, and why.
7) Do not rewrite unrelated files or refactor outside scope.

Output format (strict):
A) Changed files list  
B) For each changed file, provide full final file content with exact path  
C) If any new file is required, provide exact path and full content  
D) Compatibility checklist confirming:
- npm run dev should work
- npm run lint should pass
- npm run build should pass
E) Short note of any assumptions

Quality guardrails:
- Keep edits minimal and targeted.
- Preserve import paths and Vite conventions.
- Avoid placeholder code or TODOs.
- If requirements are ambiguous, ask one concise clarification question before generating code.


Design
The general vibe, design, typography, will be like https://www.planetono.space/ and our theme is white and black, make it minimalist, clean, sleek, elegant just like apple.com. Follow the color scheme that i have attached. For the landing page, I want an introduction to my website, key functionalities of our website, how it works for businesses and customers, reviews from customers and businesses


Context
I am making a website that allows tutors and students to find each other. The inspiration of matching is drawn from dating apps (Tinder), where tutors and students can discover each other via swiping (left is reject, right is accept). 

When the tutor/student registers for an account, they will have to first indicate if they are tutor or student. Then they have to input their basic details (name, contact number, birthday, gender, email, password, confirm password)
Once they have entered their basic details, they will be brought to their respective pages (tutor/student)

Tutor scenario: for tutors, they will be required to indicate which subjects they teach, educational level, and hourly rate, in a subject section. There will be a button “add subject” which will create another subject section for them to input the same subject details. The details will be using a dropdown to show the subjects and level, while the hourly rate will be number input. The hourly rate of each subject and level will be recorded in our backend which will be implemented later. They will also have to input their location using a text input. They also indicate their availability from Monday to Sunday. And on each day there are 1 hour time blocks to be selected from 10am to 10pm. This is similar to https://www.when2meet.com/ interface. This availability will also be recorded in our backend which will be implemented later. The tutor will also be required to input their highest level of education. 

Student scenario: for students, they have to input the subjects, education level and budget in the subject section like how tutors need to. They also need to indicate their location.

After completing registration, tutors and students are directed to the homepage, which is also their discover page. There will be a navbar on the left, collapsible. Navbar consists of a discovery page, matched page, requests page, schedule page, profile page. In the discover page, tutors will find profiles of students in card stacks like in https://app.cordy.sg/opportunities/for-you, and vice versa. The card will show an auto generated profile picture, along with the student/tutor name as the biggest text in the card. It will also include other details like age, level, subjects that they are interested in/are teaching, and budget/per hour rate. When clicking into the card, a more detailed profile will appear as a pop up, where you can see other details like location, gender.  For tutors, the availability will also be shown only when you click into the profile as day, followed by timeslots for that day. Swiping will be like https://app.cordy.sg/opportunities/for-you and when you swipe left you reject, when you swipe right you accept. When both student and teacher swipe right on each other, they match. When they match, a pop up will say “you have matched!”

On the matched page for students, they can see all the profiles of the tutors they have matched with as individual cards, which are shown like how they were in discover page. When they click into each individual tutors card, they can see the tutors profile like how it is seen as the pop up in the discover page. However, the tutor’s availability (1h timeslots for each day that they have indicated) will be clickable, and more than one timeslot can be chosen. They can only select timeslots from one day. They will also have to choose which subject and level they want to learn from the tutor, which are shown as a dropdown. These subjects and levels are pulled from our database which stores the subjects and levels that the tutor is interested in teaching. There will also be a price that will be auto filled based on the subject and level (both subject and level must have an input for a price to be generated). Only after subject, level and at least one timeslot is chosen, then they can click confirm to send the booking request to the tutor. There will be a confirmation pop up that says the booking request was sent successfully. 

On the matched page for tutors, they will be able to see who matched with them as cards like in discover as well, and when they click into the card, they can see more details like the pop up in discover (contact details which cannot be found in the cards in discover). There will not be any extra functionalities.

On the request page for students, there will be 2 sections, awaiting request and awaiting payment. In the awaiting requests section, students can see the requests that they sent to tutors. They will appear as horizontal bars across the page. When they click into each bar, they can see tutor details, as well as the day and timeslot that they opted for. They can also cancel their request. In the awaiting payment section, students can see the tutors that have accepted their request as horizontal bars. When they press into it, they see the details as well as a pay button. Pay button will lead them straight to stripe.

On the request page for tutors, tutors can see the requests sent from students. They will appear horizontal bars across the page. When they click into each bar, they can see student details, as well as the day and timeslot that they opted for. They can also confirm or cancel their request. 

On the schedule page for both tutors and students, it will be shown as a timetable format. When they click into each block, they can see the details of the lesson that is happening at that time.

When you click on the profile on navbar, a pop up will appear which shows profile, settings, FAQ safety guidelines and sign out. On the profile page for both student and teacher, display the details as shown in their cards. In settings allow them to edit their details. Generate the rest yourself. 
