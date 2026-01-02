-- Course 05: VARIOUS EVENT ACTIVITIES (HM-402 Unit 05)
-- This SQL file creates the course, weeks, and lessons for Unit 05

-- Insert Course
INSERT INTO courses (id, title, description, is_active, display_order)
VALUES (
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  'Various Event Activities',
  'This unit covers different types of events including private events, corporate events, conferences, exhibitions, charity events, live events, sports events, and festivals.',
  true,
  5
) ON CONFLICT (id) DO NOTHING;

-- Insert Week 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  1,
  'Various Event Activities',
  'To understand various types of events, study importance of exhibitions, analyze reasons for popularity of festivals, and highlight various activities associated with special events',
  1
) ON CONFLICT (course_id, week_number) DO NOTHING;

-- Lesson 5.1: Types of Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-1',
  'Week 1',
  'Types of Events',
  '2 hours',
  'Reading and Classification',
  'Understanding of event types',
  'Any kind of event may be either entirely new or needed to be developed. Development of existing event occurs when new management team assigned to work on event that has already been on-going.

Events Broadly Categorized Into:
• Private Events
• Corporate Events
• Charity Events
• Live Events

Private Events:
• Used for individuals who can book venues for special celebrations
• Designed with special event planners providing creative inputs
• Examples: Wedding, Wedding receptions, Birthday parties, Special occasions
• Industry diverse due to events aimed at various segments
• Private event rooms booked for celebrations mainly wedding events
• Hosts want privacy for event
• Will have guest list to ensure venue not open to public

Leisure Events:
• Activity apart from obligations of work, family, and society
• Individual turns at will for relaxation, diversion, or broadening knowledge
• Participation requires motivation process
• Two main motives: desire to move away (pushing motivation) and wish to see different places (pulling motivation)
• Provides platform to individuals to socialize and share common interests',
  ARRAY['Private Events', 'Leisure Events', 'Event Categories', 'Event Types'],
  1
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.2: Corporate Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-2',
  'Week 1',
  'Corporate Events',
  '3 hours',
  'Reading and Planning',
  'Understanding of corporate events',
  'The term "MICE" in context of travel is acronym for Meetings, Incentives, Conferences and Exhibitions. Refers to specialized niche of group tourism dedicated to planning, booking and facilitating conferences, seminars and other events.

Meetings:
• Corporate meeting may seem straight-forward to plan
• Event planner job to make sure meeting held as per guidelines
• Can have several objectives including igniting employee passion and forging solid teamwork
• Most important part is determining what decisions take place as result of meeting
• Global business environment has positive effect on Meeting industry
• Technological environment includes online conferencing, online bookings, multimedia, software for presentations

Incentive Events:
• Meant to renew employee loyalty as well as consumer loyalty
• Should be short but definitely memorable
• Consider reason for performing event
• Motivational speakers great for inspiring employees
• Entertaining comedian or band can set mood for customers
• Should be light-hearted and exciting

Team-Building Events:
• Great for fostering right mindset for employees to flourish
• Objective to build up employees'' productivity
• Accomplished through activities that build trust, relationships and morale
• Consider what activities will fire up client employees
• Activity combining working together and enjoying great day outside fosters experience

Business Dinners:
• Classic corporate event perfect for celebrating milestones
• Recognize employees for contributions
• Important to consider atmosphere and theme
• Balance important
• Food going to be primary concern

Launch Parties:
• Perfect way to give out necessary information while generating excitement
• Most companies open parties to potential customers or clients
• Have guests in industry on hand for presentations and speeches
• May have samples or giveaway packets
• Entertainment for celebration

Award Ceremonies:
• Honor staff or acquire customers gaining popularity
• Important type of events
• Society loves to honour people for achievements
• Coordinated by in-house meeting or marketing professionals or outside companies
• Small ceremonies could be held in company board room or local restaurant
• Big community events face unique challenges',
  ARRAY['MICE', 'Meetings', 'Incentives', 'Team Building', 'Award Ceremonies'],
  2
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.3: Conferences
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-3',
  'Week 1',
  'Conferences',
  '3 hours',
  'Reading and Conference Planning',
  'Understanding of conference management',
  'Conferences and Seminars are educational events that can be used to quickly upgrade employees'' knowledge base or showcase company''s expertise on specific topic.

Conference Types:
• Strategic Development/Corporate Retreat - generate ideas for future success
• Training and Development Workshop - upskill and educate group
• Sales/Product Summit - communicate new product information
• Association Meeting - review past performance and determine future direction
• Celebratory Event - reward group for achievements

Planning Areas:
• Preferred event dates, and any alternate event dates
• Guest details
• Expected duration of event
• Projected number of attendees
• Expected package inclusions (catering, accommodation, room hire)
• Budget
• Number of accommodation rooms required
• Contact details of prominent members

Things to Consider for International Conferences:

Venue:
• Must have adequate space to accommodate number of guests
• Rooms or sections for speakers, workshops, exhibitors, vendors
• Many hotels cater to convention atmosphere
• Can provide common rooms as well as hotel accommodations
• Often at discount for large groups

Food:
• Setting up hospitality room always good idea
• Offer finger foods and non-alcoholic drinks
• Comfortable, informal setting where guests can mingle

Translators:
• For international group, translators must
• Venue may have multi-lingual staff
• Event should have own translators available

Agenda:
• Setting event timing and creating flow crucial
• Concurrent events can be scheduled without regard to relative position
• Events scheduled one after another should be close together
• Short break between
• Staggered, mixed schedule best

Equipment:
• Most conferences require audio and visual equipment
• Lighting, computer stations, television screens
• Communications crucial
• Presentations must be clear in back row as front

Transportation:
• Airlines often offer deals for groups
• Experienced travel agent can broker deal
• Local travel should also be considered

Entertainment:
• If banquet, little creativity can score lot of points
• Arrange something memorable',
  ARRAY['Conferences', 'International Conferences', 'Conference Planning', 'Venue Selection'],
  3
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.4: Exhibitions
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-4',
  'Week 1',
  'Exhibitions',
  '3 hours',
  'Reading and Exhibition Planning',
  'Understanding of exhibitions',
  'Many names used to indicate events whose main purpose is to bring buyers and sellers together and promote trade. Terms Trade Fair, Trade Exhibition and Trade Show often used to indicate same type of event.

Categories of Exhibitions and Fairs:

1. Specialized Trade Fair:
• Normally occurs at regular intervals in same place
• Sometimes called Industry Fairs
• Admission restricted to professionals of sector
• Can be international, regional, national or local

2. Commercial Exhibition:
• Event organized by and for representative number of companies
• Addressed to specific target group of clients
• Generally does not take place recurrently
• Organized ad hoc to cope with specific marketing or industrial needs

3. Private Exhibition:
• Display of products or services of one supplier
• Targeted to selected clientele
• Example: launching of new product or positioning in new market area

4. Trade Mart:
• Sizable and fixed commercial establishment
• Made of many showrooms
• Promote and sell products and services on continuous basis

5. Conference Fairs:
• Small trade show
• Display of specific range of products
• Accompanies events whose main content are conferences and seminars

Factors in Organizing Exhibitions:
• Points of gravity of international trade
• Market forces influencing demand
• Steady growth of national industry
• Professionalism and marketing acumen of organizers
• Exhibition needs to evolve with requirements of market
• Strong local industry determines attractiveness
• Self-reliance allows exhibition to last and grow
• Proper exhibition organization gives stamp of professionalism
• Reliable infrastructures and facilities
• Safe and attractive environment
• Cost of participation should be in line with what exhibition can offer',
  ARRAY['Exhibitions', 'Trade Fairs', 'Commercial Exhibitions', 'Trade Marts'],
  4
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.5: Exhibition Design
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-5',
  'Week 1',
  'Exhibition Design',
  '2 hours',
  'Reading and Design Planning',
  'Understanding of exhibition design',
  'Exhibition Design: Process of conveying information through visual storytelling and environment. Integrative, multidisciplinary process that combines:

• Architecture
• Interior design
• Graphic design
• Experience and interaction design
• Multimedia and technology
• Lighting
• Audio
• Other disciplines

Applications:
• Museums
• Visitor centers
• Heritage parks
• Themed entertainment venues
• Trade shows
• Corporate environments
• Expositions
• Retail stores

Exhibition Design:
• Harnesses physical space and visual storytelling
• Creates environments that communicate
• Can be limited to single display
• Can be expressed in immersive, architecturally integrated environments
• Increasingly media-driven, social, and democratized
• Content generated by designers, curators, and users themselves

Regional Development:
• Asia, Asia Pacific, Middle-East and Africa contributing to exhibition industry
• Launch of new shows as well as regional versions
• Signifies need of highly advanced and equipped venues
• Parallel with development of convention centres
• Strong marketing of destinations and advanced infrastructure will contribute to development',
  ARRAY['Exhibition Design', 'Visual Storytelling', 'Multimedia', 'Design Process'],
  5
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.6: Charity Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-6',
  'Week 1',
  'Charity Events',
  '2 hours',
  'Reading and Planning',
  'Understanding of charity events',
  'Charity events used for individuals to raise money for charity of their choice by events such as:

• Society balls
• Sports events
• Charitable auctions

Sponsored Events:
• May ask for sponsors for individual partaking in event
• Range from: Sponsored runs, Sponsored cycling, Sponsored skydiving, Sponsored walks

Charity Events Industry:
• Very diverse industry
• Anyone can go to charity venue, contribute to charity event
• Involves supporting community that supports local business
• Picking worthy local charity or charitable event can gain goodwill
• Benefits business through contacts made and relationships built

Sponsorship:
• Represents give and take between non-profit and business
• Business donates money toward costs associated with charity event
• In return, charity event affords business low cost public exposure and marketing
• Charities sponsorship success rate strongly dependent on perks offered
• Can offer potential business partners',
  ARRAY['Charity Events', 'Fundraising', 'Sponsorship', 'Community Support'],
  6
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.7: Live Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-7',
  'Week 1',
  'Live Events',
  '2 hours',
  'Reading and Analysis',
  'Understanding of live events',
  'Live events including theatre, music, dance, opera use production equipment and services such as:

• Staging
• Scenery
• Mechanicals
• Sound
• Lighting
• Video
• Special effects
• Transport
• Packaging
• Communications
• Costume and makeup

Purpose: Convince live audience members that there is no better place they could be at moment.

Music Events:
• Music festivals reflect social and cultural values
• Largely satisfy many basic human needs
• Need for participation, for creation, for identity
• Music festivals part of society
• Linked inextricably to larger systems in which society embedded

Role of Music Festivals:
• Unique way for people to satisfy several needs at same time:
  - To participate in social event
  - To be part of creative process
  - To identity oneself with community

Interactions Between Stakeholders:
• Four main stakeholders identified:
  - The organisation
  - The audience
  - The artists
  - The suppliers',
  ARRAY['Live Events', 'Music Festivals', 'Production', 'Stakeholders'],
  7
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.8: Sports Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-8',
  'Week 1',
  'Sports Events',
  '3 hours',
  'Reading and Sports Event Planning',
  'Understanding of sports events',
  'Sports events integral part of recreational activity. Primary aim of sports competition is to set performance sequence of participants by various calculations.

Benefits of Sports Events:
• Sports are investment in tourism industry
• Creates economic growth through filled hotels, restaurants and retail establishments
• Creates exposure and enhances positive image for community
• Creates new product, new tourism destination
• Maximizes facility use in community
• Builds community relationships and strengthens corporate support
• Creates youth opportunity/entertainment
• Attracts high-yield visitors, especially repeaters
• Generates favorable image for destination
• Increases community support for sport and sport-events

Hosting Sports Event:
• First obtain all proper forms or minimum requirements from events rights holder
• Develop strategic plan to secure and compile necessary information
• Bid is initial commitment making on behalf of community
• Must accurately represent community''s resources
• Many elements requested are vital to ensure success of event

Sports Event Planning:
• Organized for variety of reasons: fundraising, recruitment of members, enhancing public awareness, celebration
• Successful event requires thorough and detailed planning well in advance
• Whether national, regional, county or local significance',
  ARRAY['Sports Events', 'Tourism', 'Economic Growth', 'Community Support'],
  8
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.9: Meeting the Challenge - Sports Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-9',
  'Week 1',
  'Meeting the Challenge - Sports Events',
  '2 hours',
  'Reading and Analysis',
  'Understanding of sports event challenges',
  'Staging major sporting events is no small feat and requires planning and execution within context of rigid demands:

Rigid Demands:
• No elasticity on time frame for events - dates are immoveable
• All construction projects must be completed prior to events
• Sport facilities and venues, athletes village, infrastructure and ancillary projects such as new hotels
• All aspects of planning, staging, and hosting are international media event
• Any mistakes on part of host city/nation will be seen and judged both globally and instantaneously

These Factors Mean:
• Governance, transparency, and process controls become increasingly important
• During planning and staging of major sporting events

Additional Challenges:
• Complex interdependencies as exponential growth occurs in:
  - Complexity of multiple interdependent projects
  - Refinement of designs, requirements, costs
  - Changes in project priorities
  - Number of stakeholders involved
  - Making decisions, managing risk, creating deliverables
  - Tracking revenue and venue progress
  - Dependencies between venues and infrastructure projects
  - Venue projects and events operations

Ground Rules for Sports Events:
• Whole organisation and co-ordinating committee should understand purpose and objectives
• Venue should have site suitability assessment undertaken
• Event manager appointed, primarily responsible in pre-planning and on day
• Duties, roles and responsibilities allocated as early as possible
• Authority should be delegated
• For major events, establish specialist sub-committees
• Clear communication lines established and maintained
• All bookings, decisions and transactions put in writing
• Targets and deadlines set
• Event manager makes sure helpers know their roles
• Ensure helpers adequately trained and equipped
• Plan for contingencies (bad weather, emergency procedures, health and safety, insurance)
• Continually address key questions: who, what, when, why and how',
  ARRAY['Sports Event Challenges', 'Governance', 'Risk Management', 'Planning'],
  9
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.10: Greening Sports Events
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-10',
  'Week 1',
  'Greening Sports Events',
  '1 hour',
  'Reading and Environmental Planning',
  'Understanding of environmental considerations',
  'Important to remember that events can harm our environment. By making correct choices we could reduce impact considerably.

Pointers to Reduce Impact:
• All events should aim to use minimum amount of energy required
• Minimise lighting needed by making use of natural light wherever possible
• Water usage should be kept to minimum
• Tap water should be supplied to eliminate mileage and waste from bottled water
• Recycling facilities made available on site to match types of wastes likely to be produced
• Order only what will need and what will use for foreseeable future
• Aim to re-use where possible (food, printed materials)
• If needed, provide reusable name badges and collect them at end of event
• Influence suppliers (caterers should minimise waste from excess packaging and non-recyclable containers)
• Ensure over catering is minimised
• Aim to use recycled paper (min 80% recycled content)
• Print or copy double sided where needed',
  ARRAY['Environmental Impact', 'Sustainability', 'Green Events', 'Waste Management'],
  10
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.11: Festivals
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-11',
  'Week 1',
  'Festivals',
  '2 hours',
  'Reading and Festival Planning',
  'Understanding of festivals',
  'Basic needs satisfied by festivals: physical, interpersonal or social, and personal.

Seven Major Motives:
1. Novelty: visitors motivated by desire of seeking new experiences
2. Socialization: visitors motivated by interaction with other visitors
3. Prestige/Status: desire of positioning oneself in eyes of others as attending special events
4. Rest and Relaxation: motive of escaping from daily life stress and refreshing mentality
5. Education Value/Intellectual Enrichment: motive of expanding gaining new knowledge
6. Enhancing Kinship and Relations/Family Togetherness: enhancing kinship and desire to engage and enhance family relationship
7. Entertainment and Fun

Festivals Often Include:
• Entertainment
• Food
• Drink
• Music
• Art
• Games

Best Festivals:
• Intertwine sense of friendship and camaraderie
• Create memorable experiences
• Bring communities together',
  ARRAY['Festivals', 'Community Events', 'Cultural Events', 'Entertainment'],
  11
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.12: Festival Planning
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-12',
  'Week 1',
  'Festival Planning',
  '2 hours',
  'Reading and Planning',
  'Understanding of festival planning',
  'Organizing Festival Planning Team:
• Takes large number of people to pull off successful event
• Think ahead of everyone that should be involved
• Ensure they are on board and fully informed
• Focus large group in organizing events/task schedule
• On-site venue manager
• Possibly publicity representative
• Talent agent
• Musicians
• Event staff and volunteers

Festival Site Selection:
• Type of event company planning to host
• Geographical location and local population
• Estimated attendance numbers
• Site''s services and ease in transportation
• Vendors and attendees getting to location

Book Festival Entertainment:
• Most events have promoter who will select, negotiate and book talent
• Promoter takes many things into consideration
• Good indicator is record sales
• If group able to sell decent amount of tickets at nearby venues
• Musical preferences differ by region
• Promoter aware of current trends for area
• Promoter works with bands'' agents
• Negotiates contracts for live performances
• Ensures bands have all requested accommodations onsite

Festival Entertainment May Include:
• Amusement Rides
• Pony Rides
• Vocalists
• Dancers
• Parades
• Crafts Exhibition
• Food Exhibition
• Karate Demonstrations
• Fireworks
• Live Bands
• Street Dances
• Magicians
• Celebrity Guests
• Contests
• Art Shows',
  ARRAY['Festival Planning', 'Entertainment', 'Venue Selection', 'Talent Booking'],
  12
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.13: India as Emerging Destination
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-13',
  'Week 1',
  'India as Emerging Destination',
  '2 hours',
  'Reading and Analysis',
  'Understanding of India as MICE destination',
  'India has potential to become one of leading event management destinations globally. Ministry of Tourism putting all efforts to achieve this goal.

New Delhi:
• Capital city has been favourite MICE destination
• Numerous charm varies from ancient monuments to excellent shopping options
• Business meeting and conference here absolute pleasure
• The Ashok, New Delhi hosting meetings and conventions on international scale for more than four decades
• Convention Hall spread over 16,435 sqft
• Pillar-less Convention Hall favourite venue
• Other venues: Habitat World Convention Centre, VigyanBhawan
• Hotels with excellent convention facilities: Taj Palace, Maurya Sheraton, Le Meridien

Agra:
• City of Taj, famous for splendorous Mughal architecture
• Gives excellent chance to turn business tour to ideal heritage tour
• Jaypee Palace Hotel and Convention Centre
• Convention centre can comfortably cater to 1500 delegates
• Equipped with state-of-the-art facilities
• Audio-visual recording, satellite uplink, multi-lingual interpretation
• Sprawling banquet hall capacity to hold 350 guests
• Exclusive pre-function area for 200 guests
• Attached garden for 300 guests

India Convention Promotion Bureau (ICPB):
• Set up under patronage of Ministry of Tourism
• Promote India as venue for International Conferences and Exhibitions
• Non-profit organization
• Members: national airlines, hotels, travel agents, tour operators, tourist transport operators, conference organizers
• Participate in International MICE Tourism trade fairs
• IMEX in Frankfurt and Las Vegas
• EIBTM- Barcelona
• AIME- Melbourne
• Along with Indiatourism overseas offices

Promotion:
• India promoted as preferred MICE destination
• Through Global Incredible India media campaign
• Through Road Shows and Seminars
• Conducted by Indiatourism offices overseas
• Ministry of Tourism provides Central Financial Assistance
• For setting up Conventions Centres
• As part of scheme for Large Revenue Generating projects',
  ARRAY['India MICE', 'Destination Marketing', 'Convention Centres', 'Tourism'],
  13
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

-- Lesson 5.14: Role of ITPO
INSERT INTO course_lessons (week_id, lesson_id, date, topic, time, activity, deliverables, content, key_concepts, display_order)
VALUES (
  'b5c6d7e8-f9a0-6123-a456-789012345678',
  '5-14',
  'Week 1',
  'Role of ITPO',
  '2 hours',
  'Reading and Analysis',
  'Understanding of ITPO role',
  'India Trade Promotion Organisation (ITPO) Profile:

ITPO:
• Premier trade promotion agency of Ministry of Commerce & Industry, Govt. of India
• Committed to showcase excellence achieved by country in diverse fields
• Especially trade and commerce
• Provides wide spectrum of services to trade and industry
• Acts as catalyst for growth of India''s trade

ITPO Approves:
• Holding of international trade exhibitions in India
• Regulates holding of various expositions in India
• Primarily to avoid duplication of efforts
• Ensuring proper timing

ITPO Manages:
• India''s world class exhibition complex
• Constantly upgraded to keep in high standard of readiness
• Pragati Maidan spread over 123 acres of prime land
• In heart of India''s capital, New Delhi
• Offers about 61,290 sq. mtrs. of covered exhibition space
• In 16 halls
• Besides 10,000 sq. mtrs. of open display area
• State-of-the-art exhibition halls
• Enhanced appeal of PragatiMaidan as ideal center
• For increasing number of exhibition organisers and business visitors

ITPO Infrastructure:
• Extensive infrastructure
• Marketing and information facilities
• Availed by both exporters and importers
• Regional offices at Bangalore, Chennai, Kolkata and Mumbai
• Through respective profile of activities
• Ensure concerted and well coordinated trade promotion drive
• Throughout country

ITPO Assistance:
• Providing assistance to State Governments
• Setting up Regional Trade Promotion Centres (RTPC)
• In various State''s Capital and major cities
• Initiatives taken for establishing Trade Exhibition Complexes
• Convention Centres at Kolkata, Bhopal, Sri Nagar
• In close association by State Governments
• Industrial Development Corporations/Boards of these States

Activities & Services:
• Managing extensive trade exhibition complex, Pragati Maidan
• Organising various trade exhibitions
• Facilitating use of PragatiMaidan for holding trade exhibitions
• Timely and efficient services to overseas buyers
• Vendor identification, drawing itineraries, fixing appointments
• Establishing durable contacts between Indian suppliers and overseas buyers
• Assisting Indian companies in product development
• Organising Buyer-Seller Meets
• Organising India Promotions with Department Stores
• Participating in overseas trade exhibitions
• Arranging product displays for visiting overseas buyers
• Organising seminars/conferences/workshops
• Encouraging small and medium scale units
• Conducting research on trade and export promotion
• Enlisting involvement and support of State Governments',
  ARRAY['ITPO', 'Trade Promotion', 'Exhibitions', 'Export Promotion'],
  14
) ON CONFLICT (week_id, lesson_id) DO NOTHING;

