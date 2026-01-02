-- Course 02: EVENT MANAGEMENT PLANNING (HM-402 Unit 02)
-- This SQL file creates the course, weeks, and lessons for Unit 02

-- Insert Course
INSERT INTO courses (id, title, description, is_active, display_order)
VALUES (
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  'Event Management Planning',
  'This unit provides insight to prepare a comprehensive Event Management Plan, covering different stages of event planning, roles and responsibilities, timelines, and operational planning.',
  true,
  2
) ON CONFLICT (id) DO NOTHING;

-- Insert Week 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  1,
  'Event Management Planning',
  'To know about different stages of event planning, roles and responsibilities of people involved, ability to plan and develop timeline for event management, and ability to review planning and delivery of events',
  1
) ON CONFLICT (course_id, week_number) DO NOTHING;

-- Lesson 2.1: Event Planning Introduction
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-1',
  'Week 1',
  'Event Planning Introduction',
  '2 hours',
  'Reading',
  'Understanding of event planning process',
  'Event management is the process by which an event is planned, prepared and produced. As with any other form of management, it encompasses the acquisition, allocation, direction and control of resources to achieve one or more objectives.

Event Planning is a process of creating, communicating and implementing a more operational roadmap to guide the actions, policies and decision-making. It should align with the strategic plan and assist in its implementation.

Benefits of Event Planning:
• To define and practically apply good event planning and financial management practices
• To provide logic and justification for prioritising different tasks and decisions
• To systematically define tasks, logic, roles and responsibilities, strategic alignments, timetables, and budgets
• To provide an opportunity for key players to be consulted when setting key objectives
• To provide frameworks for developing strategies related to manpower management, marketing, competitor analysis and stakeholders',
  ARRAY['Event Planning', 'Management Process', 'Strategic Planning', 'Resource Allocation'],
  1
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.2: Forces Affecting Event Planning
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-2',
  'Week 1',
  'Forces Affecting Event Planning',
  '2 hours',
  'Reading and Analysis',
  'Understanding of environmental factors',
  'The forces affecting external environment of business:

• Political Environment: Influenced by political organization, philosophy, government ideology, nature and extent of bureaucracy and political stability.

• Social Environment: Urbanized approach towards celebration, community events and festivals, cultural diversity, shift of values.

• Technology: Important aspect in special events, internet provides new possibilities for communication, information resources, and marketing tools.

• Stakeholders: Groups, organisations, and individuals who have invested or keep an interest in the successfulness of an event. Typical stakeholders include organisers, sponsors, partners, customers and the community.

Environmental Scan using PESTEL Analysis:
• (P)olitical: Government influence on economy
• (E)conomic: Economic conditions affecting supply and demand
• (S)ocial: Socio-cultural market environment
• (T)echnological: Innovation and development
• (E)nvironmental: Ecological aspects
• (L)egal: Legal requirements and allowances',
  ARRAY['PESTEL Analysis', 'Environmental Factors', 'Stakeholders', 'Political Environment'],
  2
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.3: Steps in Event Management Plan
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-3',
  'Week 1',
  'Steps in Event Management Plan',
  '2 hours',
  'Reading and Planning',
  'Knowledge of planning steps',
  'Steps involved in planning event management plan:

Starting Off:
• Consider people who will be involved
• Invent ideas for the event
• Conduct feasibility-screen of ideas
• Form organizing team (optimal size around six people)
• Consider skills and previous experiences
• Typical tasks: organising, financing, marketing, resource finding, health and safety, legalities, and recording

Feasibility:
• What are you trying to do and for whom?
• What benefits to the participants can we build into our concept?
• What are the various plans to achieve this?
• What are the pros and cons of each concept?
• What is the best concept and how will you get there?',
  ARRAY['Planning Steps', 'Feasibility Study', 'Team Formation', 'Concept Development'],
  3
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.4: Operational Planning
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-4',
  'Week 1',
  'Operational Planning',
  '2 hours',
  'Reading and Planning',
  'Understanding of operational planning',
  'An event can be successful with careful, structured, and logical planning, which decreases uncertainty, centres attention to goals, and makes operation effective.

Planning is probably the most important phase of organising events. A draft plan should be created during the brainstorming process.

Key questions during planning:
• Who are the key representatives from within the stakeholders to champion our event?
• What is our action team committed to?
• What particular strengths and experiences do our committee members bring?

During planning process:
• Envision possible problems
• Create courses of action for urgent situations
• Analyze internal and external environments
• Consider available dates and times, competing events, demand and capacity of the market, and potential venues and staff',
  ARRAY['Operational Planning', 'Risk Analysis', 'Stakeholder Management', 'Resource Planning'],
  4
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.5: Finances and Budgets
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-5',
  'Week 1',
  'Finances and Budgets',
  '3 hours',
  'Reading and Budget Planning',
  'Understanding of budget management',
  'It is essential that all team members are aware of what has to be spent financially for planning and managing event.

Budget items to consider:
• Staff time
• Marketing expenses (design fees, printing, postage, etc.)
• Transportation
• Venue
• Guest accommodations
• Food and beverage
• Entertainment and recreation
• Audiovisual equipment and production cost
• Security (Police) etc.
• Special needs (interpreters, etc.)
• Taxes and gratuities, service charges
• Contingency fund for unanticipated expenses

Income can be generated through:
• Admission fees
• Activities that generate revenue (games, brochures, food and sales stalls, merchandise, transport services, car parks)
• Selling rights for broadcasting
• Governmental agencies budget
• Sponsors
• Grants from public agencies and private foundations',
  ARRAY['Budget Planning', 'Financial Management', 'Revenue Generation', 'Cost Management'],
  5
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.6: Sponsorship
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-6',
  'Week 1',
  'Sponsorship',
  '2 hours',
  'Reading and Planning',
  'Understanding of sponsorship development',
  'Special events may attract sponsors if they have target markets in common. Sponsorship is an effective tool for promotion of products or services for businesses.

Sponsorship Development Plan:

Step 1 – Brainstorm: Create a long list of businesses or organizations that would align well with the event.

Step 2 – Determine Purpose:
• Sponsor provides monetary contribution
• Sponsor and organizer agree upon trade value (e.g., media sponsor running ads)

Step 3 – Outreach: Be prepared for conversation about what event manager may expect from sponsor and benefits.

Step 4 – Agreement: Create and execute agreement including terms discussed during outreach.

Engaging Sponsors:
• Stay in touch throughout planning, execution, and wrap up
• Consider terms in sponsorship agreement (logo inclusion, social media mentions)
• Provide tent area, signage, opportunity for sponsor to handout branded materials',
  ARRAY['Sponsorship', 'Partnerships', 'Revenue Generation', 'Marketing'],
  6
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.7: Organize a Team
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-7',
  'Week 1',
  'Organize a Team',
  '2 hours',
  'Reading and Team Building',
  'Understanding of team organization',
  'No matter the size, a special event takes a concerted team effort to handle all details. Consider identifying:

• Event Manager or Event Chair
• Individual Chairpersons for subcommittees:

Subcommittees:
• Venue, logistics & catering management (selection, contracts, permits, insurance)
• Guest management (invitations, RSVPs, greeters, registration, seating arrangements)
• Speakers/presenters (selecting, confirming, logistics, management)
• Activities/entertainment
• Publicity/promotion (Web presence, events calendars, printed programs, media relations, signage, social media)
• Sponsor/partner management
• Transportation
• Volunteer management',
  ARRAY['Team Organization', 'Subcommittees', 'Delegation', 'Team Structure'],
  7
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.8: Blue Print of Functional Area
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-8',
  'Week 1',
  'Blue Print of Functional Area',
  '2 hours',
  'Reading and Site Planning',
  'Understanding of venue selection',
  'Finding the location and venue is important for event development. When deciding on a suitable venue consider:

• The anticipated size of the event and expected visitors
• Entrances and exits and car parking provisions
• Indoor versus outdoor requirements
• Requirements of people with special needs
• Access to infrastructure - power, water, communications, washrooms
• Risk management and occupational health and safety

Site Plan should include:
• All entrances and exits
• Information centre
• Paths used by vehicles
• Paths for pedestrians only
• Food and other stall holder locations
• Stage and temporary structure locations
• Seating arrangements
• Shade and/or shelter
• Emergency access routes
• Entertainment sites
• Toilet facilities
• Waste bins/refuse sites
• First aid posts
• Drinking water sites
• Approved liquor consumption areas
• Non-alcohol (dry) areas',
  ARRAY['Venue Selection', 'Site Planning', 'Infrastructure', 'Safety'],
  8
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.9: Security and Risk Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-9',
  'Week 1',
  'Security and Risk Management',
  '2 hours',
  'Reading and Risk Analysis',
  'Understanding of security planning',
  'Security Check posts:
• Estimate number of attendees to develop monitoring and control plan
• Understand characteristics of expected audience
• Develop comprehensive security plan
• Address training, logistics and scheduling
• Develop maps of event area and surrounding areas
• Consider command post for large events

Power & Lighting:
• Review and make arrangements for electrical/power requirements
• Ensure adequate safety guidelines
• Electrical leads should not create trip hazards
• Temporary electrical leads must be flexible cables

Water:
• Required for multiple uses (catering, entertainment, cleaning)
• Check all taps to ensure they are in good working order

Sanitary Facilities:
• Ensure adequate sanitary facilities
• Consider anticipated crowd numbers, gender of patrons, duration of event
• Ensure accessibility for people with limited mobility
• Regular restocking and maintenance

Risk Management Categories:
• Physical risks: injuries to people or damage to property
• Financial risks: increased insurance premiums, cost overruns
• Moral or ethical risks: loss of quality, adverse publicity
• Legal risks: losses from legal actions',
  ARRAY['Security', 'Risk Management', 'Safety', 'Emergency Planning'],
  9
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.10: Marketing
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-10',
  'Week 1',
  'Marketing',
  '2 hours',
  'Reading and Marketing Planning',
  'Understanding of event marketing',
  'Celebrities in Events:
• Make a list of celebrities whose personal interests match event interests
• Reach celebrities through publicist for charity events
• Celebrities get media to attend and cover event
• Provide photo opportunities
• Impact fan bases through social media
• Provide PR friendly content

Promotional Tools:
• Website – essential details, excellent source for advertising
• Newspapers – publish feature articles with photographs
• Radio Stations – early morning talk shows, trade sponsorships
• Television Stations – community calendar spots
• Posters – placed in high volume traffic locations

Marketing needs to be aimed at target market. Determine whether target market is specific group or general public. The catchment area grows in relation to size of event.',
  ARRAY['Marketing', 'Celebrities', 'Promotional Tools', 'Target Market'],
  10
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.11: Event Planning Timeline
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-11',
  'Week 1',
  'Event Planning Timeline',
  '3 hours',
  'Reading and Timeline Creation',
  'Understanding of event timeline',
  'Six Months Ahead:
• Establish event objectives
• Recruit event committee
• Select date
• Identify venue
• Develop event master plan
• Create budget
• Create communications plan
• Identify speakers/presenters
• Determine sponsorship levels
• Identify potential sponsors

Four Months Ahead:
• Determine VIPs and create RSVP tracking
• Finalize presentation topics
• Make travel arrangements
• Investigate permits, licenses, insurance
• Develop draft program
• Create event page on website

Two Months Prior:
• Send reminders regarding registration
• Confirm travel/accommodation details
• Release press announcements

One-Two Weeks Ahead:
• Schedule meeting for all committee chairs
• Finalize event script
• Brief hosts, greeters, volunteers
• Final seating plan
• Provide final RSVP numbers to caterer

One Day Ahead:
• Confirm media attending
• Ensure signage is in place
• Ensure registration tables prepared

Event Day:
• Appoint someone to arrive early
• Check-in with each Committee Chair
• Bring water for speakers
• Bring emergency kit',
  ARRAY['Timeline', 'Planning', 'Coordination', 'Deadlines'],
  11
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 2.12: Post-Event and Evaluation
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd2e3f4a5-b6c7-4890-d123-456789012345',
  '2-12',
  'Week 1',
  'Post-Event and Evaluation',
  '2 hours',
  'Reading and Evaluation',
  'Understanding of post-event activities',
  'Post-Event Activities:
• Conduct Post-Event Survey
• Conduct post-event meeting and thorough evaluation
• Gather all receipts, documentation, final attendance data
• Update budget
• Implement post-publicity plan
• Send thank-you letters to sponsors, volunteers, speakers, donors, media

Event Evaluation Techniques:
• Conducting surveys or feedback forms
• Evaluating success against aims and objectives
• Preparing SWOT analysis

SWOT Analysis examines:
• Strengths: Strong attendance, wide range of food, satisfaction with entertainers
• Weaknesses: Too few volunteers, limited media coverage, expenditure exceeding income
• Opportunities: Increasing attendance, obtaining more sponsorship
• Threats: Event disruptions due to weather, loss of key personnel',
  ARRAY['Evaluation', 'SWOT Analysis', 'Post-Event', 'Feedback'],
  12
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

