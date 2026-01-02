-- Course 04: BASIC QUALITIES OF EVENT MANAGEMENT PERSON (HM-402 Unit 04)
-- This SQL file creates the course, weeks, and lessons for Unit 04

-- Insert Course
INSERT INTO courses (id, title, description, is_active, display_order)
VALUES (
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  'Basic Qualities of Event Management Person',
  'This unit covers the essential skills, knowledge, and personal qualities required for successful event management including standards, regulations, management knowledge, interpersonal skills, leadership, and personal etiquettes.',
  true,
  4
) ON CONFLICT (id) DO NOTHING;

-- Insert Week 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  1,
  'Basic Qualities of Event Management Person',
  'To understand the role of management skills, highlight importance of interpersonal relations, discuss motivation and leadership, and study role of personal etiquettes in event management',
  1
) ON CONFLICT (course_id, week_number) DO NOTHING;

-- Lesson 4.1: Knowledge of Standards and Regulations
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-1',
  'Week 1',
  'Knowledge of Standards and Regulations',
  '2 hours',
  'Reading and Research',
  'Understanding of standards and regulations',
  'By standards, we mean guidelines or preferred approaches that are not necessarily mandatory but important in event management. Regulations are mandatory rules that must be followed such as Government imposed requirements through laws.

Every industry has standards and regulations. Knowing which ones affect your event before beginning work helps:
• Event unfold smoothly
• Effective risk analysis
• Compliance with legal requirements

Application Areas:
• Industry group (Hotels and transport)
• Department (accounting, marketing, legal)
• Technical (software development, engineering)
• Management (procurement, research & development)

Examples:
• Government agencies have specific procurement rules
• Hotel industry interested in food and hygiene regulations
• Festival event planner has different concerns

Stay up-to-date regarding your industry to apply knowledge effectively. Today''s fast paced advances can leave you behind if you don''t stay current.',
  ARRAY['Standards', 'Regulations', 'Compliance', 'Legal Requirements'],
  1
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.2: Understanding Event Environment
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-2',
  'Week 1',
  'Understanding Event Environment',
  '3 hours',
  'Reading and Cultural Analysis',
  'Understanding of cultural differences',
  'Many factors need to be understood within event environment:

Cultural and Social Environment:
• People, demographics and education
• International and political environment
• Different countries cultural influences

Physical Environment:
• Time zones
• Different countries
• How differently event will be executed
• International event team distributed throughout world

Cultural Differences Examples:

Americans:
• Tend to be informal
• Call each other by first names
• Communication style more informal
• Value individualism

Europeans:
• More formal
• Use surnames in business setting
• Communication style more formal
• Value history, hierarchy, and loyalty

Japanese:
• Communicate indirectly
• Consider themselves part of group
• Value hard work and success

Indians:
• Enjoy power distance
• Believe in authority and chain of command

Date Formats:
• North America: 2/8/2018 = February 8th
• Europe: 2/8/2018 = 2nd August

Color Meanings Vary:
• White: Purity in America, Death in Japan
• Red: Danger in US, Happiness in China
• Blue: Sadness in US, Virtue in Egypt',
  ARRAY['Cultural Awareness', 'Cross-Cultural Communication', 'International Events', 'Cultural Sensitivity'],
  2
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.3: Management Knowledge
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-3',
  'Week 1',
  'Management Knowledge',
  '2 hours',
  'Reading and Analysis',
  'Understanding of management knowledge',
  'As event manager you rely on event management knowledge and general management skills:

General Management Skills:
• Ability to plan the event
• Execute event properly
• Control event and bring to successful conclusion
• Guide event team while achieving objectives
• Balance event constraints

Inherent to Process:
• Risk and rewards
• Finance and accounting activities
• Human resource issues
• Time management
• Stress management
• Purpose for event to exist

General management skills needed in just about every event. Event managers must strongly develop:
• Planning skills
• Organizing skills
• Controlling skills
• Conflict management skills',
  ARRAY['Management Skills', 'Planning', 'Organizing', 'Controlling', 'Conflict Management'],
  3
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.4: Interpersonal Skills
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-4',
  'Week 1',
  'Interpersonal Skills',
  '2 hours',
  'Reading and Skill Development',
  'Understanding of interpersonal skills',
  'Success is relationship driven. Successful manager creates and fosters solid foundation of trust and relationships with both employees and clients.

Key Principles:
• Invest time, effort and emotion to strengthen relations
• Build one-on-one relationship with key employees
• Accessibility is key
• Small gestures inspire feelings of being personally mentored
• Greet even junior staff
• Appreciate work of others

Trustworthiness:
• Crossed mile to become crucial skill
• Critical success factor moved from ''power'' to ''power of trust''
• Display traits like honesty and integrity
• Encourage team-building
• Foster robust communication
• Build trust and respect at all levels
• Foundation quality for any business success',
  ARRAY['Interpersonal Skills', 'Relationship Building', 'Trustworthiness', 'Communication'],
  4
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.5: Delegation
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-5',
  'Week 1',
  'Delegation',
  '2 hours',
  'Reading and Practice',
  'Understanding of delegation',
  'Competent event manager successfully and accurately delegates tasks. Requires:

In-depth Understanding:
• Individuals'' talents
• Skills
• Expertise
• Passions

Utilizing Knowledge:
• Appropriately delegate tasks to right members
• Assign tasks that best fit team members
• Members more inclined to trust manager when tasks fit them
• Maintain proper balance of checking work, controlling and delegating
• Develop mutual trust between manager and group

Effective Delegation:
• Identify which member could do job
• Note what is stopping you giving task away
• Plan what you will do to give task away effectively',
  ARRAY['Delegation', 'Task Assignment', 'Trust Building', 'Team Management'],
  5
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.6: Communication
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-6',
  'Week 1',
  'Communication',
  '2 hours',
  'Reading and Communication Practice',
  'Understanding of communication',
  'Event managers usually spend ninety per cent of their time communicating. Must be good communicators, promoting clear unambiguous exchange of information.

Essential Communication:
• Keep people well informed
• Event staff must know what is expected
• What they have to do
• When they have to do it
• Budget and time constraints
• Quality specifications

Communication Management Plan Documents:
• Types of information to be communicated
• Who will communicate it
• Who receives communication
• Methods used to communicate
• Timing and frequency
• Method for updating plan
• Escalation process
• Glossary of common terms

Communication Methods:
• Mail or e-mail
• Shared web site
• Face-to-face meetings',
  ARRAY['Communication', 'Information Exchange', 'Communication Plan', 'Clear Communication'],
  6
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.7: Striving for Feedback
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-7',
  'Week 1',
  'Striving for Feedback',
  '1 hour',
  'Reading and Practice',
  'Understanding of feedback',
  'Giving encouraging and constructive feedback often emerges as defining line between event success and failure.

Giving Feedback:
• Work hard on this aspect
• Ability to receive feedback is notch higher important skill
• No matter how good you are, always room for improvement
• Learning to accept feedback about yourself
• Acting positively on feedback makes you better manager
• Smart manager perceives it as best way to optimize behaviour

Soliciting Feedback:
• Solicit feedback from members
• Work on feedback
• Will not make you small but elevate your stance
• Respect, loyalty, and devotion inspired are exceptional
• One of most important management skills to cultivate and refine',
  ARRAY['Feedback', 'Constructive Feedback', 'Self-Improvement', 'Communication'],
  7
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.8: Negotiation
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-8',
  'Week 1',
  'Negotiation',
  '2 hours',
  'Reading and Negotiation Practice',
  'Understanding of negotiation',
  'Event managers must negotiate for good of event. Must negotiate with stakeholders, vendors, and customers.

General Principles:
• Present and maintain professional attitude
• Control stress and tension
• Avoid politics and egos
• Take time to gather all facts and requirements beforehand
• Meet with proper stakeholder or site people who have authority
• Know all Do''s and Don''ts

DO:
• Define purpose and objectives of meeting
• Know event details and client expectations
• Have printed copies of meeting plans available
• Make key contacts in all services and sites
• Follow up frequently
• Obtain peer referrals
• Be ethical
• Listen and pay attention
• Know budget and constraints

DON''T:
• Sacrifice quality for cost
• Make unreasonable demands
• Insist on being final authority
• Be inconsiderate of supplier''s profit margin
• Escalate and overestimate needs',
  ARRAY['Negotiation', 'Professional Attitude', 'Stakeholder Management', 'Ethics'],
  8
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.9: Leadership
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-9',
  'Week 1',
  'Leadership',
  '2 hours',
  'Reading and Leadership Development',
  'Understanding of leadership',
  'Leadership is ability to motivate and inspire individuals to work towards expected results. Leaders inspire vision and rally people around common goals.

Effective Leaders:
• Do what they say they will do
• Keep promises and follow through on commitments
• Make sure actions are consistent with wishes of people they lead
• Have clear idea of what others value
• Believe in inherent self worth of others
• Admit to mistakes
• Create trusting and open climate
• Help others to be successful and feel empowered
• Don''t push too much
• Encourage members to do more, but know when it''s too much

Event Management:
• About getting things done from people effectively and efficiently
• Every organization different in policies, operations, culture
• Political alliances, differing motivations, conflicting interests, power struggles
• Event manager must understand all unspoken influences at work',
  ARRAY['Leadership', 'Motivation', 'Vision', 'Empowerment'],
  9
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.10: Motivation
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-10',
  'Week 1',
  'Motivation',
  '2 hours',
  'Reading and Analysis',
  'Understanding of motivation',
  'Motivation helps people work more efficiently and produce better results. Motivation is constant process that event manager must help members move towards completion with passion.

Motivating Group:
• Accomplished by using variety of group building techniques and exercises
• Recognition and rewards important part of individual motivations
• Formal ways of recognizing and promoting desirable behaviour
• Most effective when carried out by management team and event manager

Considerations:
• Individual preferences
• Cultural differences
• Some people don''t like to be recognized in front of group
• Others thrive on it
• Individual differences should be appreciated
• Both monetary and non-monetary rewards should be used',
  ARRAY['Motivation', 'Recognition', 'Rewards', 'Team Building'],
  10
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.11: Problem Solving
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-11',
  'Week 1',
  'Problem Solving',
  '2 hours',
  'Reading and Problem-Solving Practice',
  'Understanding of problem solving',
  'Problem solving is ability to understand heart of problem, look for viable solution, and make decision to implement solution.

Problem Definition:
• Premise for problem solving
• Ability to understand cause and effect of problem
• Centers on root cause analysis
• If treat only symptoms rather than cause, symptoms will perpetuate
• Treating symptom may result in greater problem

Root Cause Analysis:
• Looks beyond immediate symptoms to cause
• Affords opportunities for solutions
• Once root identified, decision must be made

Solutions:
• Can be presented from stakeholders, event team, event manager
• Viable solution focuses on more than just problem
• Looks at cause and effect of solution itself
• Timely decision needed or window of opportunity may pass

Example: Organizing special exhibition in specific area for first time - must help exhibitors understand local culture and challenges in cross-cultural environment',
  ARRAY['Problem Solving', 'Root Cause Analysis', 'Decision Making', 'Critical Thinking'],
  11
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.12: Team Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-12',
  'Week 1',
  'Team Management',
  '2 hours',
  'Reading and Team Management',
  'Understanding of team management',
  'Besides inspiring, event managers also need to lead from operational point of view. This puts team management on list of essential skills.

Team Management:
• About doing things right
• Taking action to transform vision into reality
• Master delegating, goal setting, performance evaluations, conflict management

Make Sure Things Run Smoothly:
• Team is sum of different personalities, habits, and quirks
• Managers need to coordinate team members
• Work completed on time and within budget
• Establish rules and processes that move things forward

Set Personal Example:
• Define goals in writing and believe you will achieve them
• Identify key results
• Use appearance and style to reflect achievement
• Plan to overcome internal and external obstacles
• Retain and develop people who achieve outstanding results
• Create atmosphere of excitement',
  ARRAY['Team Management', 'Operational Leadership', 'Coordination', 'Personal Example'],
  12
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.13: Risk Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-13',
  'Week 1',
  'Risk Management',
  '2 hours',
  'Reading and Risk Analysis',
  'Understanding of risk management',
  'Event managers always easy target when events don''t go to plan. Everyone wonders whether project manager could have foreseen and prevented risk.

Risk Management:
• Stay on top of event by controlling risk
• Actively mitigate against risk as far as possible
• Skill for effective risk management is really experience
• Knowing what could go wrong

Risk Identification:
• Identify risk - earlier you do that, better chances of avoiding occurrence
• Must be followed by risk plan
• Assign probability, cost, owner
• Use mitigation strategies suitable for risk
• Consider client appetite for things going wrong
• Action plans need to be incorporated into main plan
• Tracked as well

Effectively Managing Risk:
• Massive benefits
• Clients happier
• Improve delivery
• More efficient with resources
• Better value for money
• Spend less time on problems
• Less fire fighting unwelcome surprises',
  ARRAY['Risk Management', 'Risk Identification', 'Mitigation', 'Prevention'],
  13
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.14: Multitasking
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-14',
  'Week 1',
  'Multitasking',
  '1 hour',
  'Reading and Practice',
  'Understanding of multitasking',
  'At various stages of event planning process, there are numerous tasks being managed simultaneously.

Examples:
• Negotiating hotel contract
• Meeting with client to discuss guest speakers
• Booking caterer
• Interviewing rental vendors
• Exploring entertainment options
• Multiple events in planning stages all at once

Result: Juggling act

Successful Event Planners:
• Know how to effectively multitask
• Keep many aspects of event moving simultaneously
• No tasks falling by wayside

Success Lies In:
• Ability to prioritize
• Focus on each task in priority order
• Without becoming distracted
• Without becoming overwhelmed

Attributes:
• Stay calm
• Stay focused
• Stay flexible',
  ARRAY['Multitasking', 'Prioritization', 'Time Management', 'Focus'],
  14
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.15: Decoration
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-15',
  'Week 1',
  'Decoration',
  '2 hours',
  'Reading and Creative Planning',
  'Understanding of event decoration',
  'Decorating event is art of transforming reception venue into something that was only imagined. End result of painstaking effort to creatively beautify place.

Event Décor:
• Closely related to event planning
• Coordinates aspects of event to achieve premeditated ambience
• Concerned with beauty of tables, chairs, focus (stage), flowers, color coordination
• Anything to lift aesthetic of event

First Thing That Catches Attention:
• Before food, drinks etc
• Ambience created by décor
• Substantial amount of money spent on event decor
• Portrays style and taste

Decorations Necessary For:
• Setting mood
• Framing emotion
• Underscoring importance of event
• From crepe paper streamers to professionally-designed displays

Large Events:
• Require equally large displays
• Must be seen among sea of people, vendors, booths
• Colors chosen and established for event
• Reflected in promotional materials, advertisements, floral arrangements

Event Manager Must Possess:
• Skills of creativity
• Appreciate new ideas
• Allow freedom to talent in organization
• Contribute to best potential',
  ARRAY['Decoration', 'Aesthetics', 'Creativity', 'Visual Design'],
  15
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.16: Personal Etiquettes
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-16',
  'Week 1',
  'Personal Etiquettes',
  '2 hours',
  'Reading and Etiquette Practice',
  'Understanding of personal etiquettes',
  'Etiquette is respect, good manners, and good behaviour. Five elements of business behaviour:

1. Work Behavior:
• Be timely (arrive on time, complete assignments on time)
• Be polite, pleasant and courteous
• Learn work culture
• Understand work environment
• Appear as professional as possible
• Well groomed and clean
• Adopt winners attitude
• Be flexible

2. Meeting People:
• Effective handshakes
• Good eye contact
• Proper introductions
• Eye contact increases trust and shows confidence

3. Telephone Etiquette:
• Conduct yourself professionally
• Return calls same day
• Keep conversations to point
• Don''t keep someone on hold more than 30 seconds
• Leave phone number if asking callback
• Maintain phone log

4. Dining Etiquette:
• Tremendous amount of business conducted at dinner table
• Let host take lead
• Ask for suggestions
• Don''t order most expensive or least expensive
• Avoid sloppy or hard to eat foods
• Avoid alcohol even if others drinking

5. Correspondence Etiquette:
• Write follow-up letter within 48 hours
• Address women as "Ms." no matter marital status
• Sign letter
• Proof for errors
• Email: Use subject line, correct grammar, use signature',
  ARRAY['Etiquette', 'Professional Behavior', 'Communication', 'Business Manners'],
  16
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 4.17: Time Management Skills
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b4c5d6e7-f8a9-5012-a345-678901234567',
  '4-17',
  'Week 1',
  'Time Management Skills',
  '2 hours',
  'Reading and Time Management Practice',
  'Understanding of time management',
  'Skills Needed for Effective Time Management:

Patience:
• Effective planning is skill that takes time to acquire
• Practice and polish required
• Will not have perfect strategy immediately
• May fail at first attempt
• Some frustration inevitable
• Don''t let this keep you from trying

Analysis:
• Vital part of successful time management strategy
• Set aside few minutes each day to evaluate
• Determine whether tasks accomplished or not
• Figure out why
• Thoughtful analysis key to continuous improvement
• Examine what works as well as what didn''t work

Flexibility:
• Time plan most successful if not written in stone
• Subject to diseases, disasters and distractions
• Cultivate sensitivity to know when productive
• Recognize when putting task off is intelligent decision vs procrastinating

Awareness:
• Be strategic
• Plan, monitor, analyze
• Awareness of importance of time management
• Awareness of how using time
• Awareness of what works or doesn''t work

Time Management for Event Managers:
• About delivering on time
• Good time management skills must
• In control of time (own and teams'')
• Good grip on how much spent on specific activities
• Increase productivity, efficiency, effectiveness
• Reduce wasted time
• Create schedule
• Set up schedules and make sure everything delivered on time
• Set priorities
• Know how to prioritize tasks',
  ARRAY['Time Management', 'Planning', 'Prioritization', 'Productivity'],
  17
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

