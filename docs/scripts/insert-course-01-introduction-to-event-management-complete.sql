-- Course 01: INTRODUCTION TO EVENT MANAGEMENT (HM-402 Unit 01)
-- Complete SQL file with all lessons organized by weeks
-- This file creates the course, weeks, and all lessons for Unit 01

-- Insert Course
INSERT INTO courses (id, title, description, is_active, display_order)
VALUES (
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  'Introduction to Event Management',
  'This unit covers the fundamental concepts of event management including definitions, classifications, benefits, strategies, and the role of creativity in event management.',
  true,
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- ============================================
-- WEEK 1: Introduction and Definitions
-- ============================================
-- Delete existing lessons for this week first (to avoid foreign key issues)
DELETE FROM course_lessons 
WHERE week_id IN (
  SELECT id FROM course_weeks 
  WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 1
);

-- Delete existing week if it exists (to ensure we use the correct ID)
DELETE FROM course_weeks 
WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 1;

-- Insert week with specified ID
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  1,
  'Introduction to Events and Definitions',
  'To understand the concept of event management and study the different types of events',
  1
);

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
  'Events create opportunities for people to connect with an area, spend time together, celebrate and experience the diversity of cultures and foster creativity and innovation. They allow a community to come alive and provide an opportunity for a destination to showcase its tourism experience and increase economic activity.

Events contribute significantly to community building, lifestyle and leisure enhancement, cultural development, tourism promotion and increased visitation, volunteer participation, fundraising and economic development. Most importantly, events create a sense of fun and vibrancy, resulting in a strong sense of community connectivity, pride and a sense of place.',
  ARRAY['Events', 'Community Building', 'Tourism', 'Cultural Development'],
  1
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.2: Objectives
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-2',
  'Week 1',
  'Objectives of Event Management',
  '1 hour',
  'Reading',
  'Knowledge of learning objectives',
  'After reading this unit learner will be able:
• To understand the concept of event management
• To study the different types of events
• To analyse the role of creativity in event management process
• To study about the various types of event management structure',
  ARRAY['Objectives', 'Learning Outcomes', 'Event Management'],
  2
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.3: Definitions of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b1c2d3e4-f5a6-4789-b012-345678901234',
  '1-3',
  'Week 1',
  'Definitions of Events',
  '2 hours',
  'Reading and Analysis',
  'Knowledge of various event definitions',
  'There is no single universally accepted definition of event. Many authors have discussed the definition of events and the various terms used to describe them.

The Accepted Practices Exchange Industry Glossary of TERMS (APEX, 2005) defines an event as, "An organized occasion such as a meeting, convention, exhibition, special event, gala dinner, etc. An event is often composed of several different yet related functions."

Goldblatt (2005) focuses on special events as "a unique moment in time, celebrated with ceremony and ritual to satisfy specific needs."

Getz (2008) notes that events are spatial-temporal phenomena and that each is unique because of interactions among the setting, people, and management systems, including design elements and the program. He suggests two definitions:
1. A special event is a one-time or infrequently occurring event outside normal programmes or activities of the sponsoring or organizing body.
2. To the customer or guest, a special event is an opportunity for leisure, social or cultural experience outside the normal range of choices or beyond everyday experience.

Bowdin (2006) notes that the term "event" has been used "to describe specific rituals, presentations, performances or celebrations that are consciously planned and created to mark special occasions and/or to achieve particular social, cultural or corporate goals and objectives."

Jago and Shaw (1998) suggest six features of special events: attract tourists, be of limited duration, be one-off or infrequent occurrence, raise awareness/image/profile, offer social experience, be out of the ordinary.',
  ARRAY['Event Definition', 'APEX', 'Special Events', 'Spatial-Temporal Phenomena'],
  3
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- ============================================
-- WEEK 2: Classification and Types of Events
-- ============================================
-- Delete existing lessons for this week first (to avoid foreign key issues)
DELETE FROM course_lessons 
WHERE week_id IN (
  SELECT id FROM course_weeks 
  WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 2
);

-- Delete existing week if it exists (to ensure we use the correct ID)
DELETE FROM course_weeks 
WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 2;

-- Insert week with specified ID
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c1d2e3f4-a5b6-4790-c123-456789012345',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  2,
  'Classification and Types of Events',
  'To understand how events are classified and study different types of events',
  2
);

-- Lesson 1.4: Classification of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'c1d2e3f4-a5b6-4790-c123-456789012345',
  '1-4',
  'Week 2',
  'Classification of Events',
  '3 hours',
  'Reading and Categorization',
  'Understanding of event classifications',
  'There are different criteria for classification of events. The basic one classifies events as planned and unplanned. Planned events are the subject of study of event management.

When considering the scale and impact of events, they fall into four broad categories:

1. MEGA EVENTS: Events with international appeal and true global reach. Mega-events yield extraordinarily high levels of tourism, media coverage, prestige, or economic impact for the host community. They require significant infrastructure development, are typically expensive to host, and have long legacy periods. Examples include Olympic Games and FIFA Football World Cup.

2. HALLMARK EVENT: Events with the distinctive quality of the program. Hallmark events are so identified with the spirit and soul of a host community that they become synonymous with the name of the place. Examples: Carnival in Goa, Dussehra of Kullu, Khajuraho Dance festival.

3. MAJOR EVENTS: Large-scale events with strong public interest and media coverage. Major events attract large numbers of visitors and help organizers achieve good economic results. Often sports-oriented with international reputation. Examples: Formula One Grand Prix, trade fair exhibitions.

4. LOCAL EVENTS: Events targeted mainly for local audiences and staged primarily for their social, fun and entertainment value. These events produce benefits including engendering pride in the community and strengthening feeling of belonging. Examples: Lohrai, Baisakhi, local exhibitions.',
  ARRAY['Mega Events', 'Hallmark Events', 'Major Events', 'Local Events', 'Event Scale'],
  1
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.5: Categories of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'c1d2e3f4-a5b6-4790-c123-456789012345',
  '1-5',
  'Week 2',
  'Categories of Events',
  '2 hours',
  'Reading and Classification',
  'Knowledge of event categories',
  'Another common way of classifying events is by their form or content:

• Cultural Celebrations: Festivals, Carnivals, Commemorations, Religious events
• Arts and Entertainment: Concerts, Award ceremonies
• Business and Trade: Meetings, conventions, Consumer and trade shows, Fairs, markets
• Sport Competitions: Amateur/professional, Spectator/participant
• Recreational: Sport or games for fun
• Educational and Scientific: Conferences, Seminars, Clinics
• Political and State: Summits, Royal occasions, Political events, VIP visits

Events can also be categorized according to the level they are attached to particular destination:
• Events that always take place in the same community
• Events that always take place in different communities
• Events that take place simultaneously in several communities

Finally, all events can be categorized as profitable and non-profit events.',
  ARRAY['Cultural Events', 'Business Events', 'Sports Events', 'Educational Events', 'Political Events'],
  2
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.6: Types of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'c1d2e3f4-a5b6-4790-c123-456789012345',
  '1-6',
  'Week 2',
  'Types of Events',
  '2 hours',
  'Reading and Classification',
  'Knowledge of event types',
  'Events that drive international tourism in large numbers can be grouped into four main categories:

1. Niche Events – often with close links to the host destination, whether the connection is literary, culinary, adventure sports, music festivals etc. (e.g., Agra music festival). This category may also include events at the smaller end of the spectrum, such as Hemis Festival of Ladakh. Such events are relatively inexpensive to organise and are likely to attract a higher proportion of high spending international attendees.

2. Participatory Sports Events – for example, the world masters games, world police and fire games, ironman events, and junior sports events. These are "destination" events which attract thousands of competitors from outside the host country, most of whom bring multiple people with them (spouses, friends, family) and often extend their event related stay into a holiday.

3. Signature Cultural Events – events which gain an international reputation as "must see" and include, for example, South by South West (SXSW) in Austin, Texas, Sonar festival in Barcelona, White Nights in Melbourne, or the Edinburgh Fringe Festival and Hogmanay, in Scotland.

4. International Sports Events – for example, single or multi-sport events such as the World Cup Rugby, the Tour de France, and World Championships for a variety of sports. Such events can not only bring in large numbers of participants and spectators but also achieve large worldwide television coverage.',
  ARRAY['Niche Events', 'Participatory Sports', 'Signature Cultural Events', 'International Sports Events'],
  3
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- ============================================
-- WEEK 3: Benefits and Strategy
-- ============================================
-- Delete existing lessons for this week first (to avoid foreign key issues)
DELETE FROM course_lessons 
WHERE week_id IN (
  SELECT id FROM course_weeks 
  WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 3
);

-- Delete existing week if it exists (to ensure we use the correct ID)
DELETE FROM course_weeks 
WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 3;

-- Insert week with specified ID
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd1e2f3a4-b5c6-4791-d234-567890123456',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  3,
  'Benefits and Event Management Strategy',
  'To understand the benefits of events and study event management strategies',
  3
);

-- Lesson 1.7: Benefits of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd1e2f3a4-b5c6-4791-d234-567890123456',
  '1-7',
  'Week 3',
  'Benefits of Events',
  '2 hours',
  'Reading and Analysis',
  'Understanding of event benefits',
  'The potential benefits of hosting major events from the perspective of the visitor economy include:

1. Structural expansion of the visitor economy: Visitors coming to a city or region for an event will contribute to a more buoyant economy, with visitor expenditure having a multiplier effect on incomes throughout related supply chains. With the multiplier effect the host destination shall benefit in terms of employment, income and better standards of living.

2. Alignment of tourism with other strategies: The requirements of hosting a major event can be used to promote an integrated whole-of government approach, and maximise synergies between relevant development and growth. Infrastructures constructed for events are one of the most visible lasting legacies for a host city or region and can have real impacts for tourism growth.

3. Marketing and promotion: Pre-event branding associated with the successful hosting of a major event can provide lasting recognition of destination branding in key tourism markets, encourage return visitation of attendees or participants, and a better understanding of the focus of the event such as sport, arts and culture, food and wine, etc.

4. Environmental impacts: The international focus often associated with major events can help to prioritise work on an often under-developed or neglected built environment and therefore the attractiveness and competitiveness of destinations. In addition, ensuring that events are managed in an environmentally friendly manner is also becoming a high priority in terms of branding.',
  ARRAY['Economic Benefits', 'Tourism Development', 'Marketing', 'Environmental Impact', 'Multiplier Effect'],
  1
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.8: Event Management Strategy
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd1e2f3a4-b5c6-4791-d234-567890123456',
  '1-8',
  'Week 3',
  'Event Management Strategy',
  '2 hours',
  'Reading and Planning',
  'Understanding of event management strategy',
  'Events Management Strategy: Events are widely acknowledged as presenting opportunities as a strong economic and tourism generator as well as bringing a range of community and social benefits to their host destination.

The major drivers of this strategy are the cultural, social and environmental benefits of community events. A clear vision is needed to provide direction to activity in the future.

In developing this Strategy our objectives are to:
• Gain a sound understanding of existing events and venues
• Achieve clarity regarding the role and responsibilities of event management company to support and host events
• Develop a sustainable, outcome focused events programme which maximises the potential of our involvement in events
• Incorporate the cultural, lifestyle and environmental factors unique to the destination into the events programme
• Pursue campaign which support events and which contribute to overall destination marketing',
  ARRAY['Strategy', 'Planning', 'Sustainability', 'Destination Marketing'],
  2
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.9: Objectives of Event Management
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'd1e2f3a4-b5c6-4791-d234-567890123456',
  '1-9',
  'Week 3',
  'Objectives of Event Management',
  '1 hour',
  'Reading',
  'Knowledge of SMART objectives',
  'Every event must have a clearly stated overall aim; otherwise the event should not happen. Events demand a lot of concentrated effort and commitment.

As well as an overall purpose any specific event must have its own set of objectives, these must be clear and be set down in a way which will allow you to judge the success of the event after completion.

Objectives should always be SMART:
• SPECIFIC to the particular event and particular aspects of it
• MEASURABLE express the objectives in numbers and quantities
• AGREED make sure all team members know the objectives
• REALISTIC set objectives the organising team can realistically achieve
• TIMED set a timescale for achievement of the objectives',
  ARRAY['SMART Objectives', 'Goal Setting', 'Planning'],
  3
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- ============================================
-- WEEK 4: Creativity and Event Committee
-- ============================================
-- Delete existing lessons for this week first (to avoid foreign key issues)
DELETE FROM course_lessons 
WHERE week_id IN (
  SELECT id FROM course_weeks 
  WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 4
);

-- Delete existing week if it exists (to ensure we use the correct ID)
DELETE FROM course_weeks 
WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 4;

-- Insert week with specified ID
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e1f2a3b4-c5d6-4792-e345-678901234567',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  4,
  'Role of Creativity and Event Committee',
  'To analyze the role of creativity and study event committee structures',
  4
);

-- Lesson 1.10: Role of Creativity
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'e1f2a3b4-c5d6-4792-e345-678901234567',
  '1-10',
  'Week 4',
  'Role of Creativity',
  '2 hours',
  'Reading and Discussion',
  'Understanding of creativity in events',
  'Creativity is marked by the ability to create, bring into existence, to invent into a new form, to produce through imaginative skill, to make to bring into existence something new. Creativity is not ability to create out of nothing, but the ability to generate new ideas by combining, changing, or reapplying existing ideas.

Creativity is also an attitude, the ability to accept change and newness, a willingness to play with ideas and possibilities, a flexibility of outlook, the habit of enjoying the good, while looking for ways to improve it.

Creative in event management helps companies by opening up new opportunities for problem solving and growth that more conventional methods would not allow for.

There are many advantages to creativity among managers in an event management company:
• Achieving growth
• Mentoring teams in the workplace
• Finding unlikely perspectives within the business

Each of the advantages:
a. Achieving Goals and Growth: When Event managers approach goals from a creative point of view, they gain the ability to reach goals more easily. A creative manager sees unique paths to reach these goals.

b. Fostering a Positive Workplace Mentality: Creative managers present opportunities to remedy negative mindsets by implementing non-traditional techniques and ideas to include people and teams into the company''s success.

c. Finding Unlikely Perspectives: Creative managers embrace unlikely and unpopular viewpoints. Unlikely perspectives allow for new and exciting avenues to be revealed.',
  ARRAY['Creativity', 'Innovation', 'Problem Solving', 'Growth'],
  1
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.11: Event Committee
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'e1f2a3b4-c5d6-4792-e345-678901234567',
  '1-11',
  'Week 4',
  'Event Committee',
  '2 hours',
  'Reading and Analysis',
  'Understanding of committee structure',
  'The Events Committee is created with the purpose to plan, develop and administer community, recreational, and cultural events within budgetary guidelines approved annually by council and to provide advice to Council on short term issues and long term planning related to these events.

The Events Committee strives to stimulate and encourage events that meet the needs of the community and offer the best opportunity to provide economic benefits and potential to market prominent places.

Functions and Responsibilities of the Committee:
The Events Committee is to:
• Advise Council on recommendations for Council Expenditure prior to the annual budget cycle
• Fund or co-fund any capital and maintenance improvements, within agreed budgets and delegations of staff
• Develop and attract new events
• Seek partnerships to develop new events
• Provide advice when required regarding Council''s major events
• Evaluate events at the completion',
  ARRAY['Committee Structure', 'Event Organization', 'Roles and Responsibilities'],
  2
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.12: The Big Event Committee Structure
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'e1f2a3b4-c5d6-4792-e345-678901234567',
  '1-12',
  'Week 4',
  'The Big Event Committee Structure',
  '3 hours',
  'Reading and Analysis',
  'Understanding of committee roles',
  'The Big Event Committee Structure includes:

a) Executive Director/ President:
• Reserve space for executive committee meetings
• Plan and run executive committee meetings
• Oversee all procedures day of the event
• Plan and run "mock" Big Event day
• Oversee executive committees
• Liaison between client and stakeholder

b) Treasurer Revenue:
• Create and manage budget
• Approve spending
• Oversee all Expenses

c) Vice President Events:
• Set-up day of event
• Reserve all facilities for the day of the event
• Arranging all aspects
• Back Stage Management
• Work with local institutions and Police
• Registration and other formalities
• Team Management Coordination
• Work on Team Manager Trainings
• Work with Parking Coordinator
• Work with Ceremony Coordinator
• Manage entire event

d) Marketing Director:
• Develop and maintain website
• Make sure guidelines are followed for advertising
• Work with Communication and marketing personnel
• Create and implement an Action Plan for Recruitment
• Develop and execute marketing materials

e) Communication Sub Committee:
• Develop all promotional marketing items
• Design t-shirt for committee and volunteers
• Update Logo
• Manage all social media accounts
• Photographer/videographer day of the event

f) Standards Sub Committee:
• Contact organizations about participating
• Work with Marketing Director
• Create and implement an Action Plan for Recruitment
• Coordinate interest meetings
• Plan and implement recruitment events

g) Finance Sub Committee:
• Manage the monetary donations
• Write thank you notes to key players
• Gather any donations
• Govern sponsorship letters',
  ARRAY['Executive Director', 'Treasurer', 'Vice President', 'Marketing Director', 'Subcommittees'],
  3
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.13: Coordination Among Committees
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'e1f2a3b4-c5d6-4792-e345-678901234567',
  '1-13',
  'Week 4',
  'Coordination Among Committees',
  '1 hour',
  'Reading',
  'Understanding of coordination',
  'Co-ordination among sub committees is the unification and integration of the efforts of group members and to provide unity of action in the achievement of common goals. It is a hidden force which binds all the other functions of management.

No function of management can be efficiently performed unless the activities under the function are coordinated. Coordination among sub committees is a process and it is not fixed. Individual activities are not applied in coordination, it prefers group activities. The managers have to make special efforts for coordination. Coordination does not come automatically. Coordination leads to unity of action. It is essential at every level of management in order to achieve the organizational goal.',
  ARRAY['Coordination', 'Integration', 'Unity of Action', 'Management'],
  4
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- ============================================
-- WEEK 5: Functions of Event Management
-- ============================================
-- Delete existing lessons for this week first (to avoid foreign key issues)
DELETE FROM course_lessons 
WHERE week_id IN (
  SELECT id FROM course_weeks 
  WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 5
);

-- Delete existing week if it exists (to ensure we use the correct ID)
DELETE FROM course_weeks 
WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 5;

-- Insert week with specified ID
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'f1a2b3c4-d5e6-4793-f456-789012345678',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  5,
  'Functions of Event Management',
  'To understand the various functions of event management',
  5
);

-- Lesson 1.14: Functions of Event Management - Planning
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f1a2b3c4-d5e6-4793-f456-789012345678',
  '1-14',
  'Week 5',
  'Functions of Event Management - Planning',
  '3 hours',
  'Reading and Analysis',
  'Understanding of planning function',
  '1. Planning: Planning tries to optimize resource utilization across the board. A cross-functional team is a necessity here given the complexity in decision-making involved.

Beginning with understanding the client profile, the brief for the event, the target audience and number expected, a major component of any event that follows is the preparation of the event budget preparation.

The planning function is involved in micro-level event coordination activities such as liaison with the creative team discussing, facilitating and arranging for the technical specification viz., sound, light, stages and sets. Short-listing artists and stand by artists in tune with the dictates of the creative artists is one of the most challenging tasks in the planning function.

It also involves checking out alternative arrangements for locating the event, the venue, the conditions for the event and gathering information to assist in taking a decision on whether the event would be held indoors or outdoors. Understanding the requirements of licenses, clearances, etc. and arranging for the same as and when required is a fundamentally responsible task.

Deciding soft issues such as whether the show is to be a ticketed, non-ticketed, fully or partially sponsored is also part of the planning exercise. Planners then do a risk rating for the event.

Some of the event planning services that need to be taken care of: Travel Arrangements, Audio Visual Needs, Catering, Decor, Entertainment, Site Selection, Sound and Lights, Speakers, Stage Decor, Staging, Web Site Management etc.',
  ARRAY['Planning', 'Resource Utilization', 'Budget Preparation', 'Risk Rating'],
  1
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.15: Functions of Event Management - Organizing
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f1a2b3c4-d5e6-4793-f456-789012345678',
  '1-15',
  'Week 5',
  'Functions of Event Management - Organizing',
  '2 hours',
  'Reading and Analysis',
  'Understanding of organizing function',
  '2. Organizing: These events typically have a team based work environment and a project type of organisation structure and that responsibility are assigned to the relevant staff members in the team for the event.

Understanding organizing in the context of event management essentially involves the description of the activities required for an event, identifying individual and team tasks and distribution of responsibilities to coordinators. The process also involve a clear delineation of authorities and delegation of authority.

Event coordinators are essentially required for the organizing part for an event. Starting from contacting the artist or performers and in case of absence or dropouts, making standby arrangements is one of the most important functions of the event coordinator.

After planning and creative functions have worked out the game plan, the event coordinator then goes about fixing the date, terms and conditions with the artist. This is followed by arranging and creating necessary infrastructure. Planning and coordinating with the professionals for the physical availability of the sound, lights, stage, sets and seating is followed by arranging for some softer aspects of organizing.

These involve handling the publicity, which includes press meets, releases, etc. for a favourable coverage and handling of ticketing and invitations. The actual procurement of permissions and licenses from various Government departments finally becomes the coordinator''s responsibility once the planning stage decides the requirements. Arranging for hospitality management such as the stay, food and beverages, hostesses, etc. and contacting sponsors to ensure fulfilment of commitments from the event organizers'' side to their clients are part of the organizing function.',
  ARRAY['Organizing', 'Team Structure', 'Delegation', 'Coordination'],
  2
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- Lesson 1.16: Functions of Event Management - Staffing, Leading, Controlling
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'f1a2b3c4-d5e6-4793-f456-789012345678',
  '1-16',
  'Week 5',
  'Functions of Event Management - Staffing, Leading, Controlling',
  '3 hours',
  'Reading and Analysis',
  'Understanding of staffing, leading and controlling',
  '3. Staffing: Functional responsibilities in a project type organisation structure define event management staffing requirements. The importance of team structure, experience, background and expertise of team members plays a crucial role in event management.

While recruiting for events, candidates with a past background in the hospitality industry, sales and advertising would be ideally suited to tackle the stress and uncertain situations during the entire process. Events as mentioned earlier are very physical in nature. A host of skilled and unskilled volunteers and labour staff need to be guided effectively.

The overall coordinator is the person in-charge of a particular event. He has the final authority in decision-making matters related to the event. The creative manager leads the creative team. The project manager''s role is to make the event a conceptual success and plays a very important role in the planning function. The production managers are also involved from the planning stage though their main responsibility is making the event a physical success.

4. Leading and Coordination: The sum and substance of events as a whole revolves around interpersonal skills. The need for achieving synergy among individual efforts so that the team goal is reached is the main aim of coordination. The overall coordinators need to be managers with fantastic people skills. They are continually required to motivate the staff and other junior coordinators to work real hard given the physical nature of the job, the time constraints involved and the one-off nature of the event.

5. Controlling: Evaluation and correction of deviations in the event plans to ensure conformity with original plans is the gist of controlling. Evaluation is an activity that seeks to understand and measure the extent to which an event has succeeded in achieving its purpose. The basic evaluation process in events involves three steps: establishing tangible objectives, measuring the performance before, during and after the event, and lastly correcting deviations from plans.',
  ARRAY['Staffing', 'Leading', 'Coordination', 'Controlling', 'Evaluation'],
  3
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

-- ============================================
-- Summary and Review
-- ============================================
-- Delete existing lessons for this week first (to avoid foreign key issues)
DELETE FROM course_lessons 
WHERE week_id IN (
  SELECT id FROM course_weeks 
  WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 6
);

-- Delete existing week if it exists (to ensure we use the correct ID)
DELETE FROM course_weeks 
WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234' AND week_number = 6;

-- Insert week with specified ID
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1b2c3d4-e5f6-4794-a567-890123456789',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  6,
  'Summary and Review',
  'To review and consolidate learning from the course',
  6
);

-- Lesson 1.17: Summary
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'a1b2c3d4-e5f6-4794-a567-890123456789',
  '1-17',
  'Week 6',
  'Summary',
  '2 hours',
  'Review and Reflection',
  'Consolidated understanding of event management',
  'Events are a dynamic and fast-growing sector that has obvious synergies with tourism. If managed and hosted effectively, they can expand the visitor economy, provide media exposure, promote regional development, and stimulate the upgrading of infrastructure and the emergence of new partnerships for financing sport, tourism, culture, and leisure facilities.

The hosting of major events represents a unique opportunity to rethink or reposition a destination and to support the development of modern infrastructure. As such many countries now view the successful hosting of such events as a vehicle for economic growth, job creation, branding, well-being, and urban regeneration.

From a tourism perspective, many cities, regions and countries are now devoting considerable resources to developing, attracting and supporting major events as part of a wider strategy to increase visitor numbers and expenditure. However, hosts cities, regions and countries of such events face a range of challenges including funding, effective governance, and the ability to accurately evaluate the economic, social, environmental, and other added value of tourism events.',
  ARRAY['Summary', 'Tourism', 'Economic Growth', 'Infrastructure', 'Challenges'],
  1
) ON CONFLICT (week_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, key_concepts = EXCLUDED.key_concepts;

