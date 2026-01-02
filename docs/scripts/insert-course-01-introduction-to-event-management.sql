-- Course 01: INTRODUCTION TO EVENT MANAGEMENT (HM-402 Unit 01)
-- This SQL file creates the course, weeks, and lessons for Unit 01

-- Insert Course
INSERT INTO courses (id, title, description, is_active, display_order)
VALUES (
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  'Introduction to Event Management',
  'This unit covers the fundamental concepts of event management including definitions, classifications, benefits, strategies, and the role of creativity in event management.',
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- Insert Week 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  1,
  'Introduction to Event Management',
  'To understand the concept of event management, study different types of events, analyze the role of creativity, and study various types of event management structures',
  1
) ON CONFLICT (course_id, week_number) DO NOTHING;

-- Lesson 1.1: Introduction
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-1',
  'Week 1',
  'Introduction to Events',
  '2 hours',
  'Reading and Discussion',
  'Understanding of event concepts',
  'Events create opportunities for people to connect with an area, spend time together, celebrate and experience the diversity of cultures and foster creativity and innovation. They allow a community to come alive and provide an opportunity for a destination to showcase its tourism experience and increase economic activity. Events contribute significantly to community building, lifestyle and leisure enhancement, cultural development, tourism promotion and increased visitation, volunteer participation, fundraising and economic development. Most importantly, events create a sense of fun and vibrancy, resulting in a strong sense of community connectivity, pride and a sense of place.',
  ARRAY['Events', 'Community Building', 'Tourism', 'Cultural Development'],
  1
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.2: Definitions of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-2',
  'Week 1',
  'Definitions of Events',
  '2 hours',
  'Reading and Analysis',
  'Knowledge of various event definitions',
  'There is no single universally accepted definition of event. Many authors have discussed the definition of events and the various terms used to describe them.

The Accepted Practices Exchange Industry Glossary of TERMS (APEX, 2005) defines an event as, "An organized occasion such as a meeting, convention, exhibition, special event, gala dinner, etc. An event is often composed of several different yet related functions."

Goldblatt (2005) focuses on special events as "a unique moment in time, celebrated with ceremony and ritual to satisfy specific needs."

Getz (2008) notes that events are spatial-temporal phenomena and that each is unique because of interactions among the setting, people, and management systems, including design elements and the program.',
  ARRAY['Event Definition', 'APEX', 'Special Events', 'Spatial-Temporal Phenomena'],
  2
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.3: Classification of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-3',
  'Week 1',
  'Classification of Events',
  '3 hours',
  'Reading and Categorization',
  'Understanding of event classifications',
  'Events offer a unique form of tourist attraction, ranging in scale from small community festivals, through to international trade fairs, and on to the largest of global sporting events.

When considering the scale and impact of events, they fall into four broad categories:

1. MEGA EVENTS: Events with international appeal and true global reach. Mega-events yield extraordinarily high levels of tourism, media coverage, prestige, or economic impact for the host community.

2. HALLMARK EVENT: Events with the distinctive quality of the program. Hallmark events are so identified with the spirit and soul of a host community that they become synonymous with the name of the place. Examples: Carnival in Goa, Dussehra of Kullu.

3. MAJOR EVENTS: Large-scale events with strong public interest and media coverage. Major events attract large numbers of visitors and help organizers achieve good economic results.

4. LOCAL EVENTS: Events targeted mainly for local audiences and staged primarily for their social, fun and entertainment value.',
  ARRAY['Mega Events', 'Hallmark Events', 'Major Events', 'Local Events', 'Event Scale'],
  3
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.4: Types of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-4',
  'Week 1',
  'Types of Events',
  '2 hours',
  'Reading and Classification',
  'Knowledge of event types',
  'Events can be categorized by their form or content:

• Cultural Celebrations: Festivals, Carnivals, Commemorations, Religious events
• Political and State: Summits, Royal occasions, Political events, VIP visits
• Arts and Entertainment: Concerts, Award ceremonies
• Business and Trade: Meetings, conventions, Consumer and trade shows, Fairs, markets
• Educational and Scientific: Conferences, Seminars, Clinics
• Sport Competition: Amateur/professional, Spectator/participant
• Recreational: Sport or games for fun
• Private Events: Weddings, Parties, Socials, Business events

Events that drive international tourism can be grouped into:
• Niche Events – often with close links to the host destination
• Participatory Sports Events – destination events attracting competitors
• Signature Cultural Events – events with international reputation
• International Sports Events – single or multi-sport events',
  ARRAY['Cultural Events', 'Business Events', 'Sports Events', 'Private Events', 'Niche Events'],
  4
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.5: Benefits of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-5',
  'Week 1',
  'Benefits of Events',
  '2 hours',
  'Reading and Analysis',
  'Understanding of event benefits',
  'The potential benefits of hosting major events include:

1. Structural expansion of the visitor economy: Visitors contribute to a more buoyant economy, with visitor expenditure having a multiplier effect on incomes throughout related supply chains.

2. Alignment of tourism with other strategies: Requirements of hosting a major event can promote an integrated whole-of government approach and maximise synergies between relevant development and growth.

3. Marketing and promotion: Pre-event branding associated with successful hosting can provide lasting recognition of destination branding in key tourism markets.

4. Environmental impacts: International focus can help prioritize work on built environment and therefore the attractiveness and competitiveness of destinations.',
  ARRAY['Economic Benefits', 'Tourism Development', 'Marketing', 'Environmental Impact', 'Multiplier Effect'],
  5
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.6: Event Management Strategy
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-6',
  'Week 1',
  'Event Management Strategy',
  '2 hours',
  'Reading and Planning',
  'Understanding of event management strategy',
  'Events Management Strategy objectives:
• Gain a sound understanding of existing events and venues
• Achieve clarity regarding the role and responsibilities of event management company
• Develop a sustainable, outcome focused events programme
• Incorporate cultural, lifestyle and environmental factors unique to the destination
• Pursue campaigns which support events and contribute to overall destination marketing

Event Planning helps to:
• Think ahead and prepare for the future
• Clarify goals and develop a vision
• Identify issues that will need to be addressed
• Choose between options
• Consider whether a project is possible
• Make the best use of resources
• Motivate staff and the community',
  ARRAY['Strategy', 'Planning', 'Sustainability', 'Destination Marketing'],
  6
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.7: Objectives of Event Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-7',
  'Week 1',
  'Objectives of Event Management',
  '1 hour',
  'Reading',
  'Knowledge of SMART objectives',
  'Every event must have a clearly stated overall aim. Objectives should always be SMART:

• SPECIFIC to the particular event and particular aspects of it
• MEASURABLE express the objectives in numbers and quantities
• AGREED make sure all team members know the objectives
• REALISTIC set objectives the organising team can realistically achieve
• TIMED set a timescale for achievement of the objectives',
  ARRAY['SMART Objectives', 'Goal Setting', 'Planning'],
  7
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.8: Role of Creativity
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-8',
  'Week 1',
  'Role of Creativity',
  '2 hours',
  'Reading and Discussion',
  'Understanding of creativity in events',
  'Creativity is marked by the ability to create, bring into existence, to invent into a new form, to produce through imaginative skill. Creativity helps companies by opening up new opportunities for problem solving and growth.

Advantages of creativity in event management:
• Achieving growth
• Mentoring teams in the workplace
• Finding unlikely perspectives within the business

Creative managers:
• See unique paths to reach goals
• Foster a positive workplace mentality
• Embrace unlikely and unpopular viewpoints',
  ARRAY['Creativity', 'Innovation', 'Problem Solving', 'Growth'],
  8
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.9: Event Committee
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-9',
  'Week 1',
  'Event Committee',
  '2 hours',
  'Reading and Analysis',
  'Understanding of committee structure',
  'The Events Committee is created with the purpose to plan, develop and administer community, recreational, and cultural events within budgetary guidelines.

Functions and Responsibilities:
• Advise Council on recommendations for Council Expenditure
• Fund or co-fund capital and maintenance improvements
• Develop and attract new events
• Seek partnerships to develop new events
• Provide advice regarding Council''s major events
• Evaluate events at completion

The Big Event Committee Structure includes:
• Executive Director/President
• Treasurer Revenue
• Vice President Events
• Marketing Director
• Communication Sub Committee
• Standards Sub Committee
• Finance Sub Committee',
  ARRAY['Committee Structure', 'Event Organization', 'Roles and Responsibilities'],
  9
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 1.10: Functions of Event Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-10',
  'Week 1',
  'Functions of Event Management',
  '3 hours',
  'Reading and Analysis',
  'Understanding of event management functions',
  'Key functions of event management:

1. Planning: Optimizes resource utilization. Involves understanding client profile, target audience, budget preparation, venue selection, licensing, and risk rating.

2. Organizing: Involves team-based work environment, project type organization structure, coordination of arrangements, and delegation of responsibilities.

3. Staffing: Functional responsibilities define staffing requirements. Importance of team structure, experience, background and expertise.

4. Leading and Coordination: Achieving synergy among individual efforts. Overall coordinators need fantastic people skills to motivate staff.

5. Controlling: Evaluation and correction of deviations in event plans. Involves establishing objectives, measuring performance, and correcting deviations.',
  ARRAY['Planning', 'Organizing', 'Staffing', 'Leading', 'Controlling', 'Coordination'],
  10
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

