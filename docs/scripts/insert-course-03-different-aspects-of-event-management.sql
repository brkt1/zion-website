-- Course 03: DIFFERENT ASPECTS OF EVENT MANAGEMENT (HM-402 Unit 03)
-- This SQL file creates the course, weeks, and lessons for Unit 03

-- Insert Course
INSERT INTO courses (id, title, description, is_active, display_order)
VALUES (
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  'Different Aspects of Event Management',
  'This unit covers stage management, brand management, budgeting, leadership, and success evaluation in event management.',
  true,
  3
) ON CONFLICT (id) DO NOTHING;

-- Insert Week 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  1,
  'Different Aspects of Event Management',
  'To understand the importance of stage management, identify the role of branding, study the concept and advantages of Budgeting, understand various leadership skills required, and evaluate the role of feedback in event management',
  1
) ON CONFLICT (course_id, week_number) DO NOTHING;

-- Lesson 3.1: Stage Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-1',
  'Week 1',
  'Stage Management',
  '3 hours',
  'Reading and Analysis',
  'Understanding of stage management',
  'The stage manager plays a major role in the production and performance process of any event company. The role varies depending on the size and type of the organisation and on the scale of the event being hosted.

Responsibilities of Stage Manager:

General:
• Distributes stage plans to stage crew and venue management
• Coordinates stage crew activities
• Assists with or supervises stage preparation including unloading, setup and positioning of concert stage elements
• Works with act and venue management to modify plans if health, safety or logistics issues arise
• Ensures act receives everything requested for backstage facilities

Technical:
• Reviews concert technical requirements with act, manager and technicians
• Monitors lighting, speakers, microphones and other equipment during rehearsals
• Supervises lamp, sound, rigging and other stage equipment tests
• Makes technical adjustments or call cues to technical crew during performance

Performance:
• Clears stage prior to performance
• Advises act when it''s time to go onstage
• Cues stage actions (opening and closing curtains)
• Supervises stage cleanup and removal after performance',
  ARRAY['Stage Management', 'Technical Coordination', 'Performance Management', 'Safety'],
  1
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.2: Stage Manager Duties - Live Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-2',
  'Week 1',
  'Stage Manager Duties: Live Events',
  '2 hours',
  'Reading and Planning',
  'Knowledge of stage manager duties',
  'Pre-Production Duties:
• Review Institutional and Rules Regarding Production
• Create Contact Sheet
• Create Rehearsal Schedule with Director
• Get Ground Plan and Dimensions of Performance Space
• Distribute Rehearsal Schedule
• Figure out Specific Needs of Production

Rehearsal Process:
• Distribute Daily Rehearsal Calls
• Collect Emergency Contact Forms
• Call Breaks and Meal Breaks
• Protect Safety of Cast
• Distribute Script
• Create Costume List
• Coordinate Communication within Design Team
• Send Rehearsal Reports (illnesses/injuries, notes for technical departments, upcoming events)

Technical Process:
• Lead Rehearsals of Show
• Create and Maintain Calling Script
• Begin Calling Cues
• Create and Distribute Preset Lists for Backstage Crew
• Create and Distribute Run Sheets
• Manage Backstage Crew
• Organize Backstage Traffic
• Find Solutions to Safety Problems

Performances:
• Coordinate with Front of House
• Call Show''s Cues (automated scenery, lights, sounds, projection, orchestra, actors)
• Maintain artistic integrity of show
• Run rehearsals for show maintenance
• Update Calling Script, Preset Lists and Run Sheets
• Send Performance Reports',
  ARRAY['Pre-Production', 'Rehearsal Management', 'Technical Process', 'Performance Management'],
  2
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.3: Brand Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-3',
  'Week 1',
  'Brand Management',
  '2 hours',
  'Reading and Analysis',
  'Understanding of brand management',
  'Branding has become one of the most important aspects of business strategy. The brand is the product as it is experienced and valued in everyday social life.

Determinants of Brand Management:

1. Firms: The event management firm shapes the brand through all product-related activities. All elements of marketing mix (product, communication, channels, pricing) are used to create image.

2. Popular Culture: Events are promoted through films, television, books, magazines, Internet, mass media. Companies seek to manage how brands are presented through public relations and paid sponsorships.

3. Customers: Customers determine effectiveness of brand culture as they consume the product. They create experience stories involving the event.

4. Influencers: Non-customers'' opinions are influential (trade magazine reviews, opinions from mavens and connoisseurs, retail salespeople opinions).',
  ARRAY['Brand Management', 'Marketing Mix', 'Customer Experience', 'Influencers'],
  3
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.4: Components of Brand Value
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-4',
  'Week 1',
  'Components of Brand Value',
  '2 hours',
  'Reading and Analysis',
  'Understanding of brand value components',
  'Components of Brand Value:

1. Reputation Value: Brands serve event firm reputations. Customers take risk when purchasing products. Brand operates as signalling mechanism to increase customers'' confidence in product quality and reliability.

2. Relationship Value: Brands communicate that firm can be trusted to act as long-term partner that will flexibly respond to future customer needs. Relationship value accumulates as stories, images, and associations become conventional.

3. Brand Cultures: Brand acts as perceptual frame that highlights particular benefits. This framing guides consumers in choosing events and shapes product experiences. Provides savings in search costs.

4. Symbolic Value: Brands act as symbols that express values and identities. Serve as concrete markers of statuses, lifestyles, politics, and aspirational social identities.

Most successful brand cultures offer single coherent story where components work together synergistically.',
  ARRAY['Reputation', 'Relationship Value', 'Brand Culture', 'Symbolic Value'],
  4
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.5: Designing Brand Strategy
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-5',
  'Week 1',
  'Designing Brand Strategy',
  '2 hours',
  'Reading and Strategy Development',
  'Understanding of brand strategy design',
  'Brand strategy is key part of overall marketing strategy. Four-step process:

Step 1: Identify goals that branding can address
• Brand strategies appropriate when business goal can be achieved by enhancing perceived product value
• Branding requires changing shared conventions - long-term project
• Not usually good tool for short-term sales goals

Step 2: Map existing brand culture
• Evaluate existing brand culture across four components
• Requires market research attuned to four different components
• Survey feedback from attendees, sponsorship organizations, stakeholders

Step 3: Analyze competitive environment
• Competitive benchmarking is important driver
• Identify opportunities competitors have not acted on
• Consider consumers, technology, infrastructure, customer preferences, shifts in society and culture

Step 4: Design the strategy
• Describe movement from existing to desired brand culture
• Map current brand culture
• Outline opportunities to enhance brand culture
• Detail desired brand culture

Implementation:
• Specify which marketing mix elements will be used
• Balance branding objectives against other marketing goals',
  ARRAY['Brand Strategy', 'Competitive Analysis', 'Market Research', 'Implementation'],
  5
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.6: Budgeting in Event Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-6',
  'Week 1',
  'Budgeting in Event Management',
  '3 hours',
  'Reading and Budget Planning',
  'Understanding of event budgeting',
  'An event budget is the total sum of money allocated for particular purpose of event for specific period. Goal is to control event costs within approved budget and deliver expected event goals.

Budget Management Steps:
• Defining the Budget
• Executing the Budget
• Controlling the Budget
• Updating the Budget

Inputs for Budget Preparation:
• Event contract or initial budget
• Resource requirements
• Resource cost estimates
• Activity duration estimates
• Historical information
• Market conditions
• Donor and organization policies

Outputs:
• Cost estimates by activity
• The Event Budget
• The Budget Variance Report',
  ARRAY['Budget Management', 'Cost Control', 'Resource Planning', 'Financial Planning'],
  6
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.7: Criteria in Budget Development
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-7',
  'Week 1',
  'Criteria in Budget Development',
  '2 hours',
  'Reading and Budget Development',
  'Understanding of budget development criteria',
  'To develop budget, applicable cost factors associated with event tasks are identified. Cost of performing task is directly related to:

• Personnel assigned to task
• Duration of task
• Cost of non-labour items required

Types of Budget Heads:

1. Human Resources:
• Consulting services
• Right people with expertise and skills
• People from organization or hired for duration
• Consultants with high level technical expertise
• Develop list of human resource requirements (expertise level, experience, education, language)

2. Equipment and Material Resources:
• Specialized tools (water pumps, electrical generators)
• Vehicles and office equipment
• Utility services (electricity, telephone, internet)
• Office material and space
• Materials for temporary facilities
• Food and exhibits

3. Other Costs:
• Cost of venue
• Marketing
• Special arrangements for events
• Dependent on duration, participant groups, venue, scale of event',
  ARRAY['Human Resources', 'Equipment', 'Material Resources', 'Cost Factors'],
  7
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.8: Budget Control
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-8',
  'Week 1',
  'Budget Control',
  '2 hours',
  'Reading and Analysis',
  'Understanding of budget control',
  'Monitoring and controlling event budget ensures only appropriate event changes are included in budget baseline.

Budget Control:
• Critical responsibility of event manager
• Organization defines roles and responsibilities
• Finance department records, tracks and monitors budget from cost accounting perspective
• Event manager monitors if budget follows event goals and targets

Budget Performance:
• See if event expenses are executed according to budget plan
• Identify deviations and develop corrective actions
• Track actual expenditures and monetary commitments
• Consider contracts and purchase orders not yet recorded

Corrective Actions:
• Predefined limit for under or over budget
• If above limit, take corrective actions
• May include trade-offs (reducing scope or lowering quality)
• Use alternative options to produce similar output
• Consult with event team and staff',
  ARRAY['Budget Control', 'Performance Monitoring', 'Corrective Actions', 'Variance Analysis'],
  8
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.9: Leadership
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-9',
  'Week 1',
  'Leadership',
  '2 hours',
  'Reading and Analysis',
  'Understanding of leadership in events',
  'Leadership involves ability to influence people to take actions toward completing goal. Events contain number of components and event manager needs dynamic leadership skills.

Event Manager''s Role:
• Multi-dimensional environment (event office, intra-organization, inter-organization)
• Complex communication paradigm
• Large team with multi-faceted mix
• Tenuous lines of authority and power
• Responsibility without authority
• Must achieve objectives with leadership styles oriented toward maintaining productivity and positive human relations

Leadership Definition:
• Influencing process between leaders and followers
• Getting things done through others
• Inspiring people assigned to event to work as team
• Achieving event objective through event team',
  ARRAY['Leadership', 'Influence', 'Team Management', 'Communication'],
  9
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.10: Leadership Skills
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-10',
  'Week 1',
  'Leadership Skills',
  '2 hours',
  'Reading and Skill Development',
  'Understanding of leadership skills',
  'Core Management Skills:

1. Technical Skills:
• Knowledge and ability to use methods, processes, techniques, tools and equipment
• Understanding facility management plan
• Various equipment required during event
• Aspects of space layout
• Systems approach for completing tasks

2. Interpersonal Skills:
• Ability to understand, communicate and work well with individuals and groups
• Developing effective relationships
• Negotiating, motivating, decision making, problem solving
• Building team morale and fostering good working relations

3. Conceptual Skills:
• Ability to understand challenges of future
• Select action plans to solve problems
• Take advantage of opportunities
• Critical thinking, analyzing alternatives
• Maximize positive outcome for organization

Skills needed vary depending on level of management and type of event.',
  ARRAY['Technical Skills', 'Interpersonal Skills', 'Conceptual Skills', 'Management'],
  10
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.11: Qualities of Leaders
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-11',
  'Week 1',
  'Qualities of Leaders',
  '2 hours',
  'Reading and Self-Assessment',
  'Understanding of leadership qualities',
  'Successful Event Leaders Require:

Emotional Resilience and Communication:
• High motivational abilities
• Self-awareness
• Communication in negotiation skills
• Understanding group dynamics

Empowering Employees:
• Give holistic perspective
• Prepare for challenging roles
• Create work environment that empowers people
• Involve team members in decisions
• Empower them to make decisions within area of responsibility

Developing Employees:
• Bolstering others'' abilities through feedback and guidance
• Believing in others'' potential
• Encouraging them to take demanding tasks
• Investing time in coaching team members
• Providing mentoring and challenging assignments
• Acknowledging strengths and contributions

Intellectual Leadership:
• Critical analysis and judgement
• Analytical skills
• Vision and imagination
• Being creative
• Setting vision for event team

Trustworthiness:
• Establish feeling of trustworthiness
• Develop rapport with employees
• Active listener
• Handle difficult situations
• Diplomatic mechanism
• Establish credibility',
  ARRAY['Empowerment', 'Employee Development', 'Intellectual Leadership', 'Trustworthiness'],
  11
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.12: Success of the Event
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-12',
  'Week 1',
  'Success of the Event',
  '2 hours',
  'Reading and Evaluation',
  'Understanding of event success metrics',
  'Event outcomes are measurable changes observed as result of event''s successful completion. Outcomes are short-term and medium-term effects on stakeholders.

Understanding Key Performance Areas (KPIs):
• Agreed upon by all parties before event begins
• Meaningful to intended audience
• Quantifiable measurements
• Directed toward benefits event seeks to deliver
• Basis for critical decision-making
• Aligned with objectives and vision plan
• Realistic, cost-effective and tailored to organization
• Unified with organizational efforts
• Reflective of organization''s success factors
• Specific to organization and particular event

Scope of KPIs:
• Event schedule
• Estimate to event completion
• Current development backlog
• Labour costs spent per month
• Current resource allocation
• Deviation of planned hours of work
• Percentage of milestones missed
• Cost variance

Motivation:
• Use KPIs as performance management tool
• Use as motivational tool
• Team competition, incentives and rewards
• Assess event goals objectively and fairly',
  ARRAY['KPIs', 'Performance Metrics', 'Success Measurement', 'Evaluation'],
  12
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 3.13: Event Feedback
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f3a4b5c6-d7e8-4901-f234-567890123456',
  '3-13',
  'Week 1',
  'Event Feedback',
  '2 hours',
  'Reading and Feedback Collection',
  'Understanding of feedback methods',
  'Event Feedback Categories:

Operational:
• On-time performance (Event management software)
• On-budget performance (Business budgeting software)
• Number of attendees (Event booking platforms)

Brand Awareness:
• Social shares (Social media monitoring tools)
• PR mentions (PR monitoring tools)
• Word of mouth (Online survey software)

Customer Satisfaction:
• Net Promoter Score (Specialized software)
• Reviews & testimonials (Online review sites)

Business Impact:
• Attendees (CRM software)
• Partners and Sponsors
• Revenue: Ticket sales (Event ticketing sites), Other guest revenue, Sponsorships

Impact Indicators:
• Objectives and event goal provide framework for evaluation
• Achievement of each objective measured by results and benefits
• Achievement of event goal measured by impact indicators
• Indicators must be quantifiable and documented
• Include target numbers and tracking systems

Methods:
• Reporting method crucial part of evaluation plan
• Specify frequency and responsible parties
• Regular monitoring and evaluation of progress
• Process evaluation determines if plan was followed effectively',
  ARRAY['Feedback', 'Evaluation Methods', 'Impact Indicators', 'Performance Measurement'],
  13
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

