import { useEffect, useState } from 'react';
import { FaAward, FaBook, FaCalendarAlt, FaCertificate, FaCheckCircle, FaChevronDown, FaChevronRight, FaClock, FaDownload, FaFileAlt, FaGraduationCap, FaLanguage, FaPlayCircle, FaSignOutAlt, FaSpinner, FaStar, FaUser, FaUsers, FaVideo, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/layout/Layout';
import { isElearningUser } from '../services/auth';
import { supabase } from '../services/supabase';

interface Lesson {
  id: string;
  date: string;
  topic: string;
  time: string;
  activity: string;
  deliverables: string;
  content?: string; // Main learning content for the lesson
  keyConcepts?: string[];
  videos?: {
    topic: string;
    youtubeId?: string; // YouTube video ID (will be provided by user)
    description?: string;
  }[];
  notes?: string;
  completed: boolean;
}

interface Week {
  weekNumber: number;
  theme: string;
  goal: string;
  lessons: Lesson[];
  completed: boolean;
}

const Elearning = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [viewedLessons, setViewedLessons] = useState<Set<string>>(new Set()); // Track which lessons have been viewed
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Course data structure - mutable to update completion status
  const [weeks, setWeeks] = useState<Week[]>([
    {
      weekNumber: 1,
      theme: 'The Foundation: Strategy & Planning',
      goal: 'Interns will be able to define an event\'s purpose, target audience, and create a basic project plan and budget.',
      lessons: [
        {
          id: '1-1',
          date: 'Mon, Month 1',
          topic: 'Course Kick-off & Event Psychology',
          time: '3 hrs',
          activity: 'AM: Welcome, course overview, icebreaker. Lesson: "What is an Event?" - Understanding guest journey & experience design.',
          deliverables: 'Analyze a past event (wedding, conference, concert) and map the guest\'s emotional journey.',
          content: `## What is an Event?

An event is more than just a gathering of people. It's a carefully orchestrated experience designed to create lasting memories and achieve specific goals. Understanding the psychology behind events is crucial for successful event planning.

### The Guest Journey

Every event has three distinct phases that shape the guest experience:

**Pre-Event Phase:**
- Initial awareness and invitation
- Registration and confirmation
- Anticipation building
- Information gathering

**During-Event Phase:**
- Arrival and first impressions
- Engagement and participation
- Social interactions
- Content consumption

**Post-Event Phase:**
- Reflection and memories
- Follow-up communications
- Feedback and evaluation
- Relationship building

### Experience Design Principles

1. **Emotional Touchpoints**: Identify moments that create strong emotional responses
2. **Flow and Pacing**: Design the event rhythm to maintain engagement
3. **Sensory Engagement**: Use all five senses to create memorable experiences
4. **Personalization**: Make guests feel valued and recognized

### Key Concepts

- **Guest Journey Mapping**: Visualizing the complete guest experience from first contact to post-event follow-up
- **Emotional Arc**: Understanding how emotions should evolve throughout the event
- **Touchpoint Analysis**: Identifying critical moments that shape guest perception`,
          keyConcepts: [
            'Guest Journey Mapping',
            'Experience Design Principles',
            'Emotional Touchpoints',
            'Pre-Event, During-Event, Post-Event Phases'
          ],
          videos: [
            {
              topic: 'Introduction to Event Psychology and Guest Experience',
              youtubeId: '', // pending
              description: 'Understanding the fundamental psychology behind events and guest experiences'
            },
            {
              topic: 'Guest Journey Mapping Tutorial',
              youtubeId: 'mjy-miSy78k',
              description: 'How to map and analyze the complete guest journey'
            }
          ],
          notes: 'This foundational lesson sets the stage for understanding events beyond logistics. Focus on the "why" before diving into the "how".',
          completed: false,
        },
        {
          id: '1-2',
          date: 'Tue, Month 2',
          topic: 'Defining Your Event: Goals & Audience',
          time: '3.5 hrs',
          activity: 'Lesson: The importance of SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).',
          deliverables: 'Workshop: Interns choose an event type (e.g., "Company Tech Launch," "Non-Profit Gala") and define its core purpose, goals, and target audience profile.',
          content: `## SMART Goals Framework

SMART goals are essential for successful event planning. Each goal should be:

**Specific**: Clearly defined and unambiguous
- Instead of "increase attendance," use "increase attendance by 25% compared to last year"

**Measurable**: Quantifiable with clear metrics
- Use numbers, percentages, or specific outcomes you can track

**Achievable**: Realistic and attainable
- Consider your resources, budget, and constraints

**Relevant**: Aligned with your organization's objectives
- Goals should support your overall mission and purpose

**Time-bound**: Have a clear deadline
- Set specific dates for achieving each goal

### Target Audience Definition

Understanding your audience is crucial for event success. Consider:

**Demographics:**
- Age range, gender, location, income level, education

**Psychographics:**
- Interests, values, lifestyle, motivations

**Behavioral Patterns:**
- How they consume information, what events they attend, purchasing habits

**Pain Points:**
- Challenges they face that your event can address

### Creating Audience Personas

Develop detailed personas that represent your ideal attendees:
- Give them names and backgrounds
- Define their goals and challenges
- Understand their decision-making process
- Identify what motivates them to attend events`,
          keyConcepts: [
            'SMART Goals Framework',
            'Target Audience Segmentation',
            'Persona Development',
            'Goal Alignment & Measurement'
          ],
          videos: [
            {
              topic: 'SMART Goals for Event Planning',
              youtubeId: 'vJar_54T-rc',
              description: 'How to set Specific, Measurable, Achievable, Relevant, Time-bound goals for events'
            },
            {
              topic: 'Creating Target Audience Personas',
              youtubeId: '', // pending
              description: 'How to define and create detailed audience profiles for events'
            }
          ],
          notes: 'Clear goals and audience definition are the foundation of successful events. Spend adequate time on this step as it informs all subsequent decisions.',
          completed: false,
        },
        {
          id: '1-3',
          date: 'Wed, Month 3',
          topic: 'Budgeting 101',
          time: '4 hrs',
          activity: 'Lesson: Creating and managing an event budget. Fixed vs. variable costs, income streams, contingency planning (10-15% rule).',
          deliverables: 'Using a provided template, interns create a draft budget for their chosen event.',
          content: `## Event Budgeting Fundamentals

Creating and managing an event budget is one of the most critical skills in event planning. A well-planned budget ensures your event is financially viable and helps you make informed decisions.

### Fixed vs. Variable Costs

**Fixed Costs** remain constant regardless of attendance:
- Venue rental fees
- Insurance
- Permits and licenses
- Fixed vendor fees

**Variable Costs** change based on attendance or usage:
- Catering (per person)
- Beverages
- Materials and supplies
- Transportation

### Budget Categories

Essential budget categories include:
1. **Venue & Facilities**: Rental, setup, utilities
2. **Catering & Beverages**: Food, drinks, service
3. **Audio-Visual**: Sound, lighting, projection
4. **Marketing & Promotion**: Advertising, materials
5. **Staff & Labor**: Wages, volunteers, security
6. **Decor & Theming**: Design elements, flowers
7. **Entertainment**: Performers, speakers
8. **Transportation**: Guest and vendor transport
9. **Technology**: Registration systems, apps
10. **Contingency**: 10-15% buffer for unexpected costs

### Contingency Planning

Always include a 10-15% contingency fund in your budget. This covers:
- Unexpected price increases
- Last-minute changes
- Emergency situations
- Unforeseen expenses

### Income Streams

Potential revenue sources:
- Ticket sales or registration fees
- Sponsorships
- Vendor fees
- Merchandise sales
- Donations`,
          keyConcepts: [
            'Fixed vs. Variable Costs',
            'Budget Categories (Venue, Catering, AV, Marketing, etc.)',
            'Contingency Planning',
            'Income Streams & Revenue Projections',
            'Budget Tracking & Variance Analysis'
          ],
          videos: [
            {
              topic: 'Event Budgeting Fundamentals',
              youtubeId: 'vOpz38Y8x44',
              description: 'Creating and managing event budgets, fixed vs variable costs'
            },
            {
              topic: 'Budget Tracking and Management',
              youtubeId: 'TqwcEc1jWIE',
              description: 'How to track expenses and manage budget throughout event lifecycle'
            }
          ],
          notes: 'Budget is often the most constraining factor in event planning. Learn to be creative within budget constraints and always include a contingency fund.',
          completed: false,
        },
        {
          id: '1-4',
          date: 'Thu, Month 4',
          topic: 'Project Planning & Timelines',
          time: '3.5 hrs',
          activity: 'Lesson: Backwards planning. Creating a master timeline from event day to the present. Introduction to tools (Asana, Trello, or a simple spreadsheet).',
          deliverables: 'Build a 3-month timeline for their event project.',
          content: `## Backwards Planning Methodology

Backwards planning is a powerful technique that starts with your end goal (the event date) and works backwards to identify all necessary tasks and deadlines.

### The Process

1. **Start with Event Day**: Mark your event date
2. **Identify Critical Milestones**: What must happen before the event?
3. **Work Backwards**: Calculate when each task must start
4. **Build in Buffer Time**: Add extra days for unexpected delays
5. **Create Dependencies**: Identify tasks that depend on others

### Critical Path Activities

These are tasks that, if delayed, will delay the entire event:
- Venue booking
- Key vendor contracts
- Marketing launch
- Registration opening
- Final confirmations

### Project Management Tools

**Asana**: Great for team collaboration and task tracking
**Trello**: Visual board-based organization
**Spreadsheets**: Simple and flexible for smaller events
**Monday.com**: Comprehensive project management

Choose tools that match your team size and complexity.`,
          keyConcepts: [
            'Backwards Planning',
            'Critical Path Method',
            'Milestone Planning',
            'Task Dependencies',
            'Project Management Tools'
          ],
          videos: [
            {
              topic: 'Backwards Planning for Events',
              youtubeId: '',
              description: 'Creating timelines from event day backwards'
            },
            {
              topic: 'Project Management Tools for Events',
              youtubeId: '',
              description: 'Introduction to Asana, Trello, and other tools for event planning'
            }
          ],
          notes: 'Time management is critical in event planning. Start with the event date and work backwards, building in buffer time for unexpected delays.',
          completed: false,
        },
        {
          id: '1-5',
          date: 'Fri, Month 5',
          topic: 'Week 1 Review & Toolbox Setup',
          time: '3 hrs',
          activity: 'AM: Presentation of their Event Brief (Goal, Audience, Budget, Timeline).',
          deliverables: 'PM: Set up their digital workspace with templates for budget, timeline, and contact lists.',
          content: `## Creating an Event Brief

An event brief is a comprehensive document that consolidates all your planning work into one cohesive overview. It serves as your roadmap and communication tool.

### Event Brief Components

**1. Event Overview**
- Event name and type
- Date, time, and duration
- Location/venue
- Expected attendance

**2. Goals & Objectives**
- Primary goals (SMART format)
- Success metrics
- Key performance indicators

**3. Target Audience**
- Primary audience personas
- Demographics and psychographics
- Motivations and pain points

**4. Budget Summary**
- Total budget
- Major cost categories
- Income sources
- Contingency allocation

**5. Timeline Overview**
- Key milestones
- Critical deadlines
- Major phases

### Digital Workspace Organization

Set up organized folders:
- **Planning Documents**: Briefs, timelines, budgets
- **Vendor Communications**: RFQs, contracts, emails
- **Marketing Materials**: Designs, copy, assets
- **Event Day Materials**: Run-of-show, checklists, contacts
- **Post-Event**: Reports, feedback, photos

### Essential Templates

Create reusable templates for:
- Budget tracking spreadsheet
- Timeline/Gantt chart
- Contact list (vendors, team, stakeholders)
- Event brief template
- Run-of-show script`,
          keyConcepts: [
            'Event Brief Creation',
            'Presentation Skills',
            'Digital Organization',
            'Template Development',
            'Workflow Optimization'
          ],
          videos: [
            {
              topic: 'Creating an Event Brief',
              youtubeId: '',
              description: 'How to compile all planning elements into a comprehensive event brief'
            }
          ],
          notes: 'This session consolidates Week 1 learning. Use the presentation as an opportunity to refine your event concept based on feedback.',
          completed: false,
        },
      ],
      completed: false,
    },
    {
      weekNumber: 2,
      theme: 'The Nitty-Gritty: Logistics & Execution',
      goal: 'Interns will understand and plan for core logistical elements including venue, vendors, and technical needs.',
      lessons: [
        {
          id: '2-1',
          date: 'Mon, Month 8',
          topic: 'Venue Sourcing & Selection',
          time: '3.5 hrs',
          activity: 'Lesson: The "SCORE" method - Space, Cost, Obligations, Rules, Experience.',
          deliverables: 'Research and present 2 potential venues for their project, comparing pros/cons based on a checklist.',
          content: `## The SCORE Method for Venue Selection

The SCORE method is a comprehensive framework for evaluating venues. Use it to compare options objectively.

### S - Space

Evaluate the physical space:
- **Capacity**: Does it accommodate your expected attendance?
- **Layout**: Is the floor plan suitable for your event format?
- **Accessibility**: Are there ramps, elevators, accessible restrooms?
- **Parking**: Is there adequate parking or public transport access?
- **Multiple Spaces**: Do you need breakout rooms or separate areas?

### C - Cost

Understand all costs involved:
- Base rental fee
- Setup and breakdown fees
- Overtime charges
- Security deposits
- Additional services (cleaning, utilities)
- Hidden costs (corkage fees, equipment rental)

### O - Obligations

What are you required to do?
- Minimum catering spend
- Required vendors (in-house catering, AV)
- Insurance requirements
- Security requirements
- Cleanup responsibilities

### R - Rules

What restrictions apply?
- Noise restrictions and curfews
- Decor restrictions (no tape, no open flames)
- Alcohol policies
- Capacity limits
- Time restrictions

### E - Experience

How does the venue enhance your event?
- Ambiance and atmosphere
- Natural lighting
- Views or special features
- Reputation and prestige
- Staff professionalism`,
          keyConcepts: [
            'SCORE Method (Space, Cost, Obligations, Rules, Experience)',
            'Venue Site Visits',
            'Capacity Planning',
            'Accessibility Requirements',
            'Contract Negotiation'
          ],
          videos: [
            {
              topic: 'The SCORE Method for Venue Selection',
              youtubeId: '5bdtZ-Ie7cg',
              description: 'Space, Cost, Obligations, Rules, Experience evaluation method'
            },
            {
              topic: 'Venue Site Visit Best Practices',
              youtubeId: 'L8UvwsdnZBU',
              description: 'What to look for and questions to ask during venue tours'
            }
          ],
          notes: 'The right venue can make or break an event. Consider not just cost, but how the space supports your event goals.',
          completed: false,
        },
        {
          id: '2-2',
          date: 'Tue, Month 9',
          topic: 'The Vendor Ecosystem',
          time: '4 hrs',
          activity: 'Lesson: Key vendor types (Catering, AV, Decor, Entertainment). How to write a Request for Quote (RFQ).',
          deliverables: 'Draft an RFQ for one key vendor (e.g., caterer) for their event.',
          content: `## Understanding the Vendor Ecosystem

Events require coordination with multiple vendors, each playing a crucial role in your event's success.

### Key Vendor Categories

**1. Catering & Food Service**
- Full-service caterers
- Food trucks
- Beverage service
- Specialty food vendors

**2. Audio-Visual (AV)**
- Sound systems and microphones
- Lighting design and equipment
- Projection and screens
- Technical support staff

**3. Decor & Theming**
- Floral arrangements
- Table settings and linens
- Backdrops and staging
- Themed decorations

**4. Entertainment**
- Musicians and DJs
- Speakers and presenters
- Performers and acts
- MCs and hosts

**5. Other Essential Vendors**
- Photography and videography
- Transportation
- Security
- Waste management

### Writing Effective RFQs (Request for Quote)

A good RFQ helps vendors provide accurate quotes and ensures you get what you need.

**RFQ Components:**

1. **Event Overview**
   - Date, time, location
   - Expected attendance
   - Event type and theme

2. **Detailed Requirements**
   - Specific services needed
   - Quantities and specifications
   - Timeline and schedule

3. **Budget Information**
   - Budget range (optional but helpful)
   - Payment terms

4. **Evaluation Criteria**
   - How you'll select vendors
   - Important factors (price, quality, experience)

5. **Submission Requirements**
   - Deadline for quotes
   - Required documentation
   - Contact information

### Vendor Evaluation

When comparing vendors, consider:
- **Experience**: Have they done similar events?
- **References**: Can they provide client testimonials?
- **Price**: Is it within budget and fair?
- **Reliability**: Do they have backup plans?
- **Communication**: Are they responsive and clear?
- **Flexibility**: Can they accommodate changes?`,
          keyConcepts: [
            'Vendor Categories',
            'RFQ Writing',
            'Proposal Evaluation',
            'Vendor Contracts',
            'Relationship Management'
          ],
          videos: [
            {
              topic: 'Understanding Event Vendor Types',
              youtubeId: '',
              description: 'Overview of catering, AV, decor, entertainment vendors'
            },
            {
              topic: 'Writing Effective RFQs (Request for Quote)',
              youtubeId: '',
              description: 'How to write professional RFQs to get accurate vendor quotes'
            }
          ],
          notes: 'Good vendors are partners in your event success. Clear communication and fair contracts build lasting relationships.',
          completed: false,
        },
        {
          id: '2-3',
          date: 'Wed, Month 10',
          topic: 'Food, Beverage & Theming',
          time: '3.5 hrs',
          activity: 'Lesson: Catering styles, dietary restrictions, bar planning. How theme influences all decisions.',
          deliverables: 'Create a themed mood board and draft a simple menu for their event.',
          content: `## Food, Beverage & Theming

Food and theme are powerful tools for creating memorable event experiences. They work together to tell your event's story.

### Catering Styles

**Plated Service**: Formal, elegant, portion-controlled
- Best for: Galas, formal dinners, corporate events
- Pros: Elegant, portion control, easier dietary management
- Cons: More expensive, requires more staff

**Buffet Service**: Casual, variety, self-service
- Best for: Networking events, casual gatherings
- Pros: Variety, cost-effective, flexible
- Cons: Less elegant, potential waste, longer service time

**Family Style**: Shared platters, interactive
- Best for: Intimate gatherings, team building
- Pros: Encourages interaction, casual atmosphere
- Cons: Limited portion control, requires large tables

**Food Stations**: Themed stations, variety
- Best for: Large events, cocktail receptions
- Pros: Variety, visual appeal, guest choice
- Cons: Requires more space, potential lines

### Dietary Restrictions & Allergies

Always plan for common dietary needs:
- **Vegetarian & Vegan**: Plant-based options
- **Gluten-Free**: Celiac disease and gluten sensitivity
- **Allergies**: Nuts, dairy, shellfish (most common)
- **Religious**: Halal, Kosher, Hindu vegetarian
- **Medical**: Diabetic-friendly, low-sodium options

**Best Practice**: Ask about dietary restrictions during registration and plan for 10-15% of guests to have special dietary needs.

### Beverage Planning

**Bar Types:**
- **Open Bar**: All drinks included (most expensive)
- **Cash Bar**: Guests pay (cost-effective)
- **Hosted Bar**: Limited selection included
- **Beer & Wine Only**: Cost-effective middle ground

**Beverage Calculations:**
- Estimate 2-3 drinks per person for 3-4 hour events
- Plan for variety: beer, wine, soft drinks, water
- Always provide non-alcoholic options
- Consider signature cocktails that match your theme

### Event Theming

A cohesive theme ties all elements together:

**Theme Development:**
1. Choose a central concept or story
2. Define color palette
3. Select design elements (patterns, textures, styles)
4. Apply theme consistently across all touchpoints

**Theme Application:**
- Decor and styling
- Menu and food presentation
- Invitations and marketing materials
- Staff attire
- Music and entertainment
- Venue selection

**Creating Mood Boards:**
- Collect visual inspiration (colors, textures, styles)
- Organize by category (food, decor, ambiance)
- Use tools like Pinterest, Canva, or physical boards
- Share with vendors for consistency`,
          keyConcepts: [
            'Menu Planning',
            'Dietary Accommodations',
            'Beverage Service Styles',
            'Event Theming',
            'Mood Board Creation'
          ],
          videos: [
            {
              topic: 'Event Menu Planning',
              youtubeId: '',
              description: 'Creating menus that align with event themes and dietary needs'
            },
            {
              topic: 'Event Theming Fundamentals',
              youtubeId: '',
              description: 'How to create cohesive event themes and mood boards'
            }
          ],
          notes: 'Food and theme work together to create memorable experiences. Always plan for dietary restrictions early.',
          completed: false,
        },
        {
          id: '2-4',
          date: 'Thu, Month 11',
          topic: 'Tech & Audio-Visual Basics',
          time: '3.5 hrs',
          activity: 'Lesson: "AV 101" - Basic sound, lighting, and projection needs. The run-of-show script.',
          deliverables: 'Create a basic run-of-show for their event\'s main program.',
          content: `## Audio-Visual Basics for Events

Understanding AV needs is essential for professional event execution. Technical problems can derail even the best-planned events.

### Sound System Requirements

**Microphones:**
- **Lavalier/Lapel Mics**: Hands-free, best for speakers
- **Handheld Mics**: For Q&A, interactive sessions
- **Wireless vs. Wired**: Wireless offers mobility but can have interference

**Sound System:**
- Speakers positioned for even coverage
- Sound check before event starts
- Backup microphones and batteries
- Sound technician on-site for larger events

**Key Questions:**
- How many speakers/presenters?
- Will there be Q&A or audience participation?
- What's the room size and acoustics?
- Do you need background music?

### Lighting Basics

**Types of Lighting:**
- **Ambient**: General room lighting
- **Accent**: Highlights specific areas (stage, displays)
- **Mood**: Creates atmosphere and ambiance
- **Practical**: Functional lighting (registration, food areas)

**Considerations:**
- Natural light vs. artificial
- Dimming capabilities
- Color temperature (warm vs. cool)
- Spotlight needs for speakers

### Projection & Screens

**When You Need Projection:**
- Presentations or slideshows
- Video content
- Live streaming
- Branding and graphics

**Screen Options:**
- **Front Projection**: Screen in front, projector behind audience
- **Rear Projection**: Screen with projector behind it (cleaner look)
- **LED Walls**: High-quality, bright, expensive

**Resolution & Aspect Ratio:**
- Standard: 16:9 (widescreen)
- Ensure content matches screen format
- Test all presentations in advance

### Run-of-Show Script

A run-of-show is a minute-by-minute timeline of your event:

**Essential Elements:**
- **Time**: Exact time for each segment
- **Activity**: What's happening
- **Person Responsible**: Who's in charge
- **AV Cues**: When to play music, change slides, adjust lighting
- **Notes**: Special instructions or reminders

**Example Format:**
\`\`\`
6:00 PM - Doors Open
- Play background music
- Registration desk active
- Bar opens

6:30 PM - Welcome Remarks
- Dim lights
- Start presentation slides
- Mic check for speaker

7:00 PM - Dinner Service
- Increase lighting
- Lower background music
\`\`\`

**Best Practices:**
- Build in buffer time between segments
- Include setup and breakdown times
- Share with all key team members
- Have a printed copy on event day
- Include contact numbers for key personnel`,
          keyConcepts: [
            'Audio-Visual Basics',
            'Run-of-Show Scripts',
            'Technical Requirements',
            'AV Coordination',
            'Backup Plans'
          ],
          videos: [
            {
              topic: 'AV Basics for Event Planners',
              youtubeId: '',
              description: 'Introduction to sound, lighting, and projection needs'
            },
            {
              topic: 'Creating Run-of-Show Scripts',
              youtubeId: '',
              description: 'How to create detailed event scripts and timelines'
            }
          ],
          notes: 'Technical elements can make or break an event. Always have backup plans and test everything in advance.',
          completed: false,
        },
        {
          id: '2-5',
          date: 'Fri, Month 12',
          topic: 'Week 2 Review & Logistics Deep Dive',
          time: '3 hrs',
          activity: 'AM: Present their complete logistics plan (Venue choice, 3 key vendors, theme, run-of-show).',
          deliverables: 'PM: Q&A with a professional event planner or AV technician (guest speaker).',
          content: `## Logistics Plan Integration

This session brings together all logistics elements into a cohesive plan. A well-integrated logistics plan ensures smooth execution.

### Logistics Plan Components

**1. Venue Details**
- Selected venue and rationale
- Space layout and capacity
- Access and parking information
- Contact information

**2. Vendor Coordination**
- Key vendors (minimum 3: e.g., catering, AV, decor)
- Vendor contact information
- Delivery and setup schedules
- Payment terms and deadlines

**3. Theming & Design**
- Theme concept and color palette
- Decor elements and placement
- Mood board reference
- Branding requirements

**4. Run-of-Show**
- Complete timeline from setup to breakdown
- AV cues and technical requirements
- Staff assignments
- Key contact numbers

### Presentation Best Practices

When presenting your logistics plan:
- **Be Clear & Concise**: Highlight key decisions and rationale
- **Show Integration**: Demonstrate how elements work together
- **Address Challenges**: Acknowledge potential issues and solutions
- **Be Open to Feedback**: Use expert input to improve your plan

### Learning from Experts

Guest speakers provide real-world insights:
- Industry best practices
- Common pitfalls to avoid
- Creative solutions to challenges
- Professional tips and tricks

Take notes and ask specific questions about your event plans.`,
          keyConcepts: [
            'Logistics Integration',
            'Professional Presentation',
            'Industry Best Practices',
            'Expert Consultation'
          ],
          videos: [
            {
              topic: 'Presenting Logistics Plans',
              youtubeId: '',
              description: 'How to present comprehensive logistics plans professionally'
            }
          ],
          notes: 'This session brings together all logistics elements. Use expert feedback to strengthen your plans.',
          completed: false,
        },
      ],
      completed: false,
    },
    {
      weekNumber: 3,
      theme: 'The Human Element: People & Promotion',
      goal: 'Interns will learn how to market an event and manage communication with stakeholders, teams, and guests.',
      lessons: [
        {
          id: '3-1',
          date: 'Mon, Month 15',
          topic: 'Marketing & Registration',
          time: '4 hrs',
          activity: 'Lesson: Marketing channels (email, social, partners). Creating a registration/RSVP process.',
          deliverables: 'Draft a 4-week marketing email sequence for their event and design a simple registration form (using Google Forms or a similar tool).',
          content: `## Event Marketing Strategies

Effective marketing is essential for event success. A multi-channel approach reaches your audience where they are.

### Marketing Channels

**1. Email Marketing**
- Direct communication with your audience
- High conversion rates
- Cost-effective
- Trackable metrics (open rates, click-through rates)

**2. Social Media**
- **Facebook**: Events, community building, paid ads
- **Instagram**: Visual content, stories, reels
- **LinkedIn**: Professional events, B2B marketing
- **Twitter/X**: Real-time updates, engagement
- **TikTok**: Younger audiences, viral potential

**3. Partner Marketing**
- Collaborate with complementary organizations
- Cross-promotion opportunities
- Access to new audiences
- Credibility through association

**4. Other Channels**
- Website and blog
- Press releases and media
- Word of mouth
- Paid advertising (Google, Facebook)

### Email Marketing Sequence

Create a 4-week email sequence:

**Week 4 Before Event - Save the Date**
- Announce the event
- Key details (date, location, theme)
- Early bird pricing (if applicable)
- Create excitement

**Week 3 Before Event - Registration Open**
- Full event details
- Registration link
- Speaker/entertainment highlights
- What to expect

**Week 2 Before Event - Reminder & Details**
- Reminder to register
- Additional information
- Special features or surprises
- Build anticipation

**Week 1 Before Event - Final Push**
- Last chance to register
- Final details and logistics
- What to bring/prepare
- Excitement building

### Registration Systems

**Key Features:**
- Simple, user-friendly interface
- Mobile-responsive design
- Payment processing (if needed)
- Data collection (dietary needs, preferences)
- Confirmation emails
- Capacity management

**Registration Form Fields:**
- Name and contact information
- Dietary restrictions/allergies
- Special accommodations needed
- Emergency contact
- Optional: T-shirt size, session preferences

**Best Practices:**
- Keep forms short and simple
- Only ask for essential information
- Make it mobile-friendly
- Send immediate confirmation
- Provide clear next steps`,
          keyConcepts: [
            'Marketing Channels',
            'Email Marketing',
            'Social Media Promotion',
            'Registration Systems',
            'RSVP Management'
          ],
          videos: [
            {
              topic: 'Event Marketing Strategies',
              youtubeId: 'vPaOHLPkZfc',
              description: 'Multi-channel marketing for events (email, social, partners)'
            },
            {
              topic: 'Creating Registration Systems',
              youtubeId: '', // pending
              description: 'Setting up user-friendly registration and RSVP processes'
            }
          ],
          notes: 'Effective marketing starts early. Build anticipation and make registration easy for your audience.',
          completed: false,
        },
        {
          id: '3-2',
          date: 'Tue, Month 16',
          topic: 'Guest Experience & Communication',
          time: '3.5 hrs',
          activity: 'Lesson: Pre, during, and post-event communication. Writing clear information emails.',
          deliverables: 'Draft a "You\'re Registered!" confirmation email and a "Final Details" email sent one week before the event.',
          content: `## Guest Communication Strategy

Clear, timely communication is essential for guest satisfaction and event success. Plan your communication timeline carefully.

### Pre-Event Communication

**Immediate Confirmation Email (Upon Registration)**
Subject: "You're Registered! - [Event Name]"

Essential information:
- Confirmation of registration
- Event date, time, and location
- What to expect
- Next steps
- Contact information for questions

**One Week Before Event - Final Details Email**
Subject: "Final Details for [Event Name] - This Friday!"

Include:
- Reminder of date, time, location
- Parking and transportation options
- What to bring
- Dress code (if applicable)
- Schedule overview
- Contact information
- Weather considerations (if outdoor)

**Day Before Event - Last Reminder**
- Brief reminder
- Key logistics
- Excitement building
- Emergency contact

### During-Event Communication

**On-Site Information:**
- Welcome signage
- Program schedules
- WiFi information
- Emergency procedures
- Contact numbers for event staff

**Real-Time Updates:**
- Schedule changes
- Room changes
- Important announcements
- Social media updates

### Post-Event Communication

**Thank You Email (Within 24-48 hours)**
- Thank guests for attending
- Share highlights or photos
- Request feedback
- Provide resources or recordings
- Announce next event (if applicable)

**Follow-Up Survey (3-5 days after)**
- Gather feedback
- Learn what worked and what didn't
- Improve future events
- Show you value their input

### Writing Effective Event Emails

**Best Practices:**
- **Clear Subject Lines**: Make it easy to identify and prioritize
- **Scannable Format**: Use headers, bullet points, short paragraphs
- **Essential Info First**: Most important details at the top
- **Call to Action**: Clear next steps
- **Mobile-Friendly**: Most people read emails on phones
- **Professional but Friendly**: Match your event's tone

**Email Structure:**
1. Greeting
2. Main message/update
3. Key information (date, time, location)
4. Action items
5. Contact information
6. Closing`,
          keyConcepts: [
            'Communication Timeline',
            'Email Writing',
            'Guest Expectations',
            'Information Architecture',
            'Follow-up Strategies'
          ],
          videos: [
            {
              topic: 'Event Communication Best Practices',
              youtubeId: '',
              description: 'Pre, during, and post-event communication strategies'
            },
            {
              topic: 'Writing Effective Event Emails',
              youtubeId: '',
              description: 'How to write clear, informative event communications'
            }
          ],
          notes: 'Clear communication reduces confusion and increases attendance. Always provide essential information upfront.',
          completed: false,
        },
        {
          id: '3-3',
          date: 'Wed, Month 17',
          topic: 'Team & Volunteer Management',
          time: '3.5 hrs',
          activity: 'Lesson: Creating roles and responsibilities. Writing a clear team brief.',
          deliverables: 'Develop a team structure chart and a one-page brief for a "Registration Desk Volunteer."',
          content: `## Building Effective Event Teams

A well-organized team is the backbone of successful events. Clear roles and responsibilities prevent confusion and ensure smooth execution.

### Team Structure

**Core Team Roles:**
- **Event Manager**: Overall coordination and decision-making
- **Operations Lead**: On-site logistics and vendor coordination
- **Registration Manager**: Check-in, badges, guest services
- **AV/Technical Lead**: Sound, lighting, presentations
- **Hospitality Lead**: Food, beverages, guest comfort
- **Security/Safety Lead**: Safety protocols, emergency response

### Volunteer Management

**Recruitment:**
- Define volunteer needs early
- Create clear role descriptions
- Recruit from your network, community, or organizations
- Offer incentives (meals, swag, experience, references)

**Training:**
- Provide comprehensive briefings
- Share event details and expectations
- Practice procedures if needed
- Assign mentors or team leads

**On-Site Management:**
- Clear check-in process
- Designated volunteer area/break room
- Regular check-ins with team leads
- Recognition and appreciation

### Creating Team Briefs

A good team brief includes:

**1. Role Overview**
- Position title
- Reporting structure
- Key responsibilities

**2. Schedule**
- Arrival time
- Shift duration
- Break times
- Departure time

**3. Responsibilities**
- Specific tasks and duties
- What success looks like
- Common scenarios and how to handle them

**4. Important Information**
- Event details (date, location, theme)
- Contact numbers (team lead, emergency)
- Dress code
- What to bring

**5. Procedures**
- Check-in process
- How to handle common issues
- Escalation procedures
- Emergency protocols

### Example: Registration Desk Volunteer Brief

**Role**: Registration Desk Volunteer
**Time**: 5:00 PM - 7:00 PM
**Location**: Main entrance

**Responsibilities:**
- Welcome guests warmly
- Check names against registration list
- Issue name badges
- Direct guests to event space
- Answer basic questions
- Handle walk-ins (if space available)

**Key Information:**
- Registration list will be provided
- Badges organized alphabetically
- WiFi password: [provided]
- Contact: [Team Lead Name] at [phone]

**Common Scenarios:**
- Guest not on list: Check spelling, contact registration manager
- Guest arrives early: Welcome them, direct to waiting area
- Technical issue: Contact AV lead immediately`,
          keyConcepts: [
            'Team Structure',
            'Role Definition',
            'Volunteer Management',
            'Briefing Documents',
            'On-site Coordination'
          ],
          videos: [
            {
              topic: 'Building Event Teams',
              youtubeId: '',
              description: 'Creating effective team structures and role definitions'
            },
            {
              topic: 'Volunteer Management',
              youtubeId: '',
              description: 'How to recruit, train, and manage event volunteers'
            }
          ],
          notes: 'A well-briefed team is essential for smooth event execution. Invest time in clear communication and training.',
          completed: false,
        },
        {
          id: '3-4',
          date: 'Thu, Month 18',
          topic: 'Risk Assessment & Contingency',
          time: '3 hrs',
          activity: 'Lesson: Identifying potential risks (weather, tech failure, no-shows). Developing a Plan B.',
          deliverables: 'Brainstorm a risk register for their event and propose solutions for the top 3 risks.',
          content: `## Risk Assessment & Contingency Planning

Expect the unexpected. Proactive risk assessment and contingency planning help you handle challenges smoothly.

### Common Event Risks

**1. Weather (Outdoor Events)**
- Rain, extreme heat, wind
- **Mitigation**: Indoor backup venue, tents, weather monitoring
- **Plan B**: Move indoors, reschedule, provide shelter

**2. Technical Failures**
- AV equipment failure
- Internet/WiFi issues
- Power outages
- **Mitigation**: Backup equipment, technical support on-site, generator
- **Plan B**: Manual alternatives, backup presentations, offline mode

**3. Attendance Issues**
- Low attendance (no-shows)
- Over-attendance (more than capacity)
- **Mitigation**: Confirmation reminders, waitlist management, capacity limits
- **Plan B**: Adjust catering, seating, activities

**4. Vendor Problems**
- Vendor no-show or late arrival
- Quality issues
- **Mitigation**: Backup vendors, clear contracts, early arrival times
- **Plan B**: Alternative vendors, in-house alternatives

**5. Health & Safety**
- Medical emergencies
- Security incidents
- Food safety issues
- **Mitigation**: First aid on-site, security plan, food safety protocols
- **Plan B**: Emergency services contact, evacuation plan

**6. Speaker/Entertainment Issues**
- Speaker cancellation
- Late arrivals
- Technical difficulties
- **Mitigation**: Backup speakers, flexible schedule, pre-recorded content
- **Plan B**: Adjust program, extend other segments

### Creating a Risk Register

Document all potential risks:

**Risk Register Format:**
- **Risk**: Description of potential problem
- **Probability**: Likelihood (High/Medium/Low)
- **Impact**: Severity if it occurs (High/Medium/Low)
- **Mitigation**: How to prevent or reduce risk
- **Contingency**: Plan B if risk occurs
- **Owner**: Who's responsible for managing this risk

### Top 3 Risks to Address

For most events, prioritize:
1. **Weather/Outdoor Conditions** (if applicable)
2. **Technical/AV Failures**
3. **Vendor/Supplier Issues**

Develop detailed contingency plans for these top risks.

### Contingency Planning Principles

1. **Identify Early**: Assess risks during planning phase
2. **Plan Ahead**: Develop solutions before problems occur
3. **Communicate**: Share contingency plans with team
4. **Test When Possible**: Practice backup procedures
5. **Stay Flexible**: Be ready to adapt quickly`,
          keyConcepts: [
            'Risk Assessment',
            'Contingency Planning',
            'Risk Register',
            'Mitigation Strategies',
            'Crisis Management'
          ],
          videos: [
            {
              topic: 'Event Risk Assessment',
              youtubeId: '',
              description: 'Identifying and evaluating potential event risks'
            },
            {
              topic: 'Creating Contingency Plans',
              youtubeId: '',
              description: 'Developing Plan B strategies for common event risks'
            }
          ],
          notes: 'Expect the unexpected. Having contingency plans for common risks will save you stress on event day.',
          completed: false,
        },
        {
          id: '3-5',
          date: 'Fri, Month 19',
          topic: 'Week 3 Review & Final Project Launch',
          time: '4 hrs',
          activity: 'AM: Present their Marketing & Comms plan.',
          deliverables: 'PM: Final Project Launch: Interns are assigned (solo or in teams) to plan a real small-scale internal event (e.g., a team lunch, a farewell party, a knowledge-sharing session) for the following week.',
          content: `## Final Project: Real-World Application

This is your opportunity to apply all the skills you've learned to plan and execute a real event. This hands-on experience is invaluable.

### Project Requirements

**Event Options:**
- Team lunch or dinner
- Farewell party
- Knowledge-sharing session
- Team building activity
- Celebration event
- Workshop or training session

**Project Scope:**
- Small-scale event (10-30 people recommended)
- Real event with actual attendees
- Apply all planning principles learned
- Document the entire process

### What to Include in Your Plan

**1. Event Brief**
- Goals and objectives
- Target audience
- Budget
- Timeline

**2. Logistics Plan**
- Venue/space selection
- Food and beverage (if applicable)
- Materials and supplies needed
- Setup requirements

**3. Marketing & Communication**
- How you'll invite/notify attendees
- Pre-event communications
- Day-of information

**4. Execution Plan**
- Run-of-show
- Team roles (if working in a team)
- Contingency plans

**5. Evaluation Plan**
- How you'll measure success
- Feedback collection method
- Post-event reflection

### Project Timeline

You have one week to plan and execute:
- **Days 1-3**: Planning and preparation
- **Day 4**: Final preparations and confirmations
- **Day 5**: Event execution
- **After Event**: Reflection and report

### Success Criteria

Your project will be evaluated on:
- Application of course concepts
- Quality of planning documents
- Event execution
- Problem-solving during event
- Post-event reflection and learning`,
          keyConcepts: [
            'Knowledge Integration',
            'Project Planning',
            'Real-world Application',
            'Team Collaboration'
          ],
          videos: [
            {
              topic: 'Final Project Planning',
              youtubeId: '',
              description: 'How to apply all learnings to a real event project'
            }
          ],
          notes: 'This is your chance to apply everything you\'ve learned. Take this opportunity seriously and plan thoroughly.',
          completed: false,
        },
      ],
      completed: false,
    },
    {
      weekNumber: 4,
      theme: 'The Final Stretch: Execution & Review',
      goal: 'Interns will apply all learned skills to execute a real/simulated event and conduct a post-event analysis.',
      lessons: [
        {
          id: '4-1',
          date: 'Mon, Month 22',
          topic: 'Final Project Work Day',
          time: '4 hrs',
          activity: 'Full Day: Mentored work session. Interns finalize all plans for their Friday event: budget, run-of-show, vendor coordination (if any), communications, and team briefing.',
          deliverables: 'Complete event plan ready for execution.',
          content: `## Finalizing Your Event Plan

This dedicated work day is your opportunity to finalize every detail of your event plan. Use mentor guidance to ensure nothing is overlooked.

### Final Checklist

**Budget Finalization:**
- All costs accounted for
- Contingency fund included (10-15%)
- Payment schedules confirmed
- Budget tracking system ready

**Run-of-Show Completion:**
- Minute-by-minute timeline
- All activities scheduled
- AV cues documented
- Staff assignments clear
- Buffer time included

**Vendor Coordination:**
- All vendors confirmed
- Delivery/setup times scheduled
- Contact information organized
- Backup plans in place
- Contracts reviewed

**Communications:**
- All guest communications prepared
- Team briefings ready
- Contact lists organized
- Emergency contacts documented

**Team Briefing:**
- Roles and responsibilities clear
- Schedule shared with all team members
- Training completed (if needed)
- Contact information distributed

### Using Mentor Guidance

**Questions to Ask:**
- Are there any gaps in my plan?
- What am I missing?
- How can I improve this?
- What should I prioritize?
- What are common pitfalls to avoid?

**Areas to Review:**
- Budget accuracy
- Timeline feasibility
- Risk assessment
- Communication plan
- Team readiness

### Final Plan Components

Your complete plan should include:
1. Event brief (goals, audience, overview)
2. Detailed budget
3. Complete run-of-show
4. Vendor contact list and schedules
5. Team structure and briefs
6. Communication templates
7. Risk register and contingency plans
8. Event day checklist`,
          keyConcepts: [
            'Plan Finalization',
            'Coordination',
            'Mentorship',
            'Execution Readiness'
          ],
          videos: [
            {
              topic: 'Event Plan Finalization',
              youtubeId: '',
              description: 'Finalizing all event planning elements and coordination'
            }
          ],
          notes: 'Use this dedicated time to ensure every detail is covered. Don\'t hesitate to ask mentors for guidance.',
          completed: false,
        },
        {
          id: '4-2',
          date: 'Tue, Month 23',
          topic: 'Crisis Management & On-the-Day Problem Solving',
          time: '3 hrs',
          activity: 'Lesson: "How to Stay Calm When Things Go Wrong." Role-playing common on-site issues.',
          deliverables: 'Crisis scenario workshop (e.g., "Key speaker is late," "Caterer is short 10 meals").',
          content: `## Crisis Management for Events

Things will go wrong. Your ability to stay calm, think clearly, and solve problems quickly is what separates good planners from great ones.

### Staying Calm Under Pressure

**Mental Preparation:**
- Accept that problems will occur
- Trust your preparation and planning
- Focus on solutions, not blame
- Take deep breaths and stay present
- Remember: most problems are solvable

**Problem-Solving Framework:**
1. **Assess**: What exactly is the problem?
2. **Impact**: How does this affect the event?
3. **Options**: What are possible solutions?
4. **Decide**: Choose the best solution quickly
5. **Act**: Implement the solution
6. **Communicate**: Inform relevant team members

### Common On-Site Crises & Solutions

**Scenario 1: Key Speaker is Late**
- **Solution**: Fill time with Q&A, networking, or backup content
- **Prevention**: Confirm arrival time, have backup speakers/content
- **Communication**: Inform audience professionally

**Scenario 2: Caterer is Short on Meals**
- **Solution**: Adjust portions, order backup food, prioritize VIPs
- **Prevention**: Order 10% extra, confirm numbers day before
- **Communication**: Apologize, offer alternatives

**Scenario 3: AV Equipment Fails**
- **Solution**: Use backup equipment, simplify presentation, go manual
- **Prevention**: Test everything, have backup equipment, technical support on-site
- **Communication**: Keep audience informed, maintain energy

**Scenario 4: Over-Capacity/Too Many Attendees**
- **Solution**: Add seating, use overflow space, adjust layout
- **Prevention**: Strict capacity limits, waitlist management
- **Communication**: Welcome everyone, manage expectations

**Scenario 5: Weather Issues (Outdoor Event)**
- **Solution**: Move indoors, provide shelter, reschedule if necessary
- **Prevention**: Backup indoor venue, weather monitoring
- **Communication**: Clear instructions, safety first

### Crisis Communication

**With Team:**
- Stay calm and clear
- Assign specific tasks
- Provide updates regularly
- Support each other

**With Guests:**
- Be transparent but positive
- Focus on solutions
- Apologize when necessary
- Maintain professionalism

**With Vendors:**
- Communicate issues immediately
- Work together on solutions
- Be flexible and collaborative

### Role-Playing Exercises

Practice handling these scenarios:
- Speaker cancellation 30 minutes before
- Power outage during presentation
- Food allergy emergency
- Lost registration list
- Venue access issues
- Equipment delivery delay`,
          keyConcepts: [
            'Crisis Management',
            'Problem Solving',
            'Stress Management',
            'Quick Decision Making',
            'Communication Under Pressure'
          ],
          videos: [
            {
              topic: 'Crisis Management for Events',
              youtubeId: '',
              description: 'How to stay calm and solve problems during events'
            },
            {
              topic: 'Common Event Crises and Solutions',
              youtubeId: '',
              description: 'Role-playing and handling typical on-site issues'
            }
          ],
          notes: 'Things will go wrong. Your ability to stay calm and solve problems quickly is what separates good planners from great ones.',
          completed: false,
        },
        {
          id: '4-3',
          date: 'Wed, Month 24',
          topic: 'Final Project Rehearsal',
          time: '3 hrs',
          activity: 'AM: Interns present their final event plan to the group and "walk through" the entire day.',
          deliverables: 'PM: Peer and mentor feedback session.',
          content: `## Event Plan Walkthrough

A walkthrough is a mental rehearsal of your entire event. It helps identify potential issues before they become problems.

### Walkthrough Process

**Step 1: Present Your Plan**
- Share your complete event plan
- Explain key decisions and rationale
- Highlight unique elements
- Address potential challenges

**Step 2: Walk Through the Day**
- Start from setup/arrival
- Go through each segment chronologically
- Identify who does what and when
- Check for gaps or conflicts

**Step 3: Identify Issues**
- Look for timing conflicts
- Check for missing elements
- Identify potential bottlenecks
- Spot communication gaps

**Step 4: Receive Feedback**
- Listen to peer observations
- Consider mentor suggestions
- Ask clarifying questions
- Take notes on improvements

### What to Look For

**Timing Issues:**
- Are transitions realistic?
- Is there enough buffer time?
- Do activities flow logically?
- Are there conflicts?

**Resource Issues:**
- Do you have enough staff?
- Are materials/supplies accounted for?
- Is equipment available when needed?
- Are vendors scheduled correctly?

**Communication Gaps:**
- Does everyone know their role?
- Are contact numbers available?
- Is information shared with all stakeholders?
- Are guests informed?

**Risk Areas:**
- What could go wrong?
- Are contingency plans clear?
- Is backup support available?
- Are emergency procedures known?

### Using Feedback

**Be Open-Minded:**
- Feedback is meant to help, not criticize
- Different perspectives reveal blind spots
- Experienced planners see things you might miss

**Prioritize Changes:**
- Address critical issues first
- Fix timing and resource problems
- Clarify communication gaps
- Strengthen contingency plans

**Update Your Plan:**
- Incorporate valuable feedback
- Revise run-of-show if needed
- Update team briefs
- Adjust timelines`,
          keyConcepts: [
            'Plan Presentation',
            'Walkthrough Methodology',
            'Peer Feedback',
            'Plan Refinement'
          ],
          videos: [
            {
              topic: 'Event Walkthrough Process',
              youtubeId: '',
              description: 'How to conduct effective event plan walkthroughs'
            }
          ],
          notes: 'The walkthrough helps identify issues before event day. Take all feedback seriously and adjust your plans accordingly.',
          completed: false,
        },
        {
          id: '4-4',
          date: 'Thu, Month 25',
          topic: 'Prep Day & Mentorship',
          time: '4 hrs',
          activity: 'Full Day: Final preparations for tomorrow\'s event. Printing materials, packing kits, confirming details.',
          deliverables: 'One-on-one mentorship sessions to address final anxieties.',
          content: `## Final Preparations

Prep day is your last chance to ensure everything is ready. Thorough preparation today means a smoother event tomorrow.

### Prep Day Checklist

**Materials & Supplies:**
- Print all necessary documents (run-of-show, contact lists, registration lists)
- Prepare name badges (if applicable)
- Pack event day kit (see below)
- Organize materials by category
- Label everything clearly

**Confirmations:**
- Confirm all vendor arrival times
- Verify venue access and setup times
- Confirm team member arrival times
- Double-check guest count
- Verify all equipment and supplies

**Communication:**
- Send final reminder to guests (if needed)
- Confirm team briefings
- Share final run-of-show with team
- Provide contact information
- Set up communication channels (group chat, walkie-talkies)

**Final Checks:**
- Review run-of-show one more time
- Check weather forecast (if outdoor)
- Verify all contact numbers
- Test any technology you'll use
- Review contingency plans

### Event Day Kit

Pack a comprehensive event day kit:

**Essential Documents:**
- Run-of-show script
- Contact list (vendors, team, emergency)
- Registration list
- Budget tracking sheet
- Vendor contracts/confirmations

**Supplies:**
- Extra pens and paper
- Tape, scissors, markers
- Extension cords and power strips
- First aid kit
- Phone charger and backup battery
- Water and snacks

**Tools:**
- Measuring tape
- Flashlight
- Multi-tool
- Extra batteries
- Cleaning supplies

### One-on-One Mentorship

Use this time to:
- Address any concerns or anxieties
- Review your plan with an expert
- Get reassurance and confidence
- Ask last-minute questions
- Receive encouragement

**Common Concerns:**
- "What if something goes wrong?" - You have contingency plans
- "Am I forgetting something?" - Review your checklist
- "Will I be able to handle it?" - You're well-prepared
- "What if guests don't show?" - You've planned for this

**Remember:**
- You've prepared thoroughly
- You have support and backup plans
- Most events have minor issues - that's normal
- Your ability to adapt is your strength
- Trust your preparation`,
          keyConcepts: [
            'Final Preparations',
            'Material Organization',
            'Confirmation Processes',
            'Mental Preparation'
          ],
          videos: [
            {
              topic: 'Final Event Preparations',
              youtubeId: '',
              description: 'Pre-event day checklist and material organization'
            }
          ],
          notes: 'Preparation is key. Double-check everything today so you can focus on execution tomorrow.',
          completed: false,
        },
        {
          id: '4-5',
          date: 'Fri, Month 26',
          topic: 'EVENT DAY & DEBRIEF',
          time: '5-6 hrs',
          activity: 'AM/PM: Execute the final project event! Interns run their event. Post-Event: Immediate 30-minute "Hot Wash" debrief - what went well, what didn\'t?',
          deliverables: 'Interns are assigned to write a formal Post-Event Report due in 3 days.',
          content: `## Event Day Execution

This is it! All your planning and preparation leads to this moment. Trust your preparation, stay flexible, and remember to enjoy the experience.

### Event Day Mindset

**Stay Present:**
- Focus on what's happening now
- Don't worry about what might go wrong
- Trust your team and vendors
- Be ready to adapt

**Key Principles:**
- **Calm Confidence**: You've prepared well
- **Flexibility**: Things will change - that's okay
- **Communication**: Keep team informed
- **Problem-Solving**: Address issues quickly
- **Enjoyment**: Remember to enjoy the experience!

### During the Event

**Your Role:**
- Oversee overall execution
- Make quick decisions when needed
- Support your team
- Handle unexpected issues
- Ensure guest satisfaction

**Stay Connected:**
- Regular check-ins with team leads
- Monitor key areas (registration, AV, catering)
- Be available for questions
- Keep run-of-show handy
- Have contact list accessible

**Common Tasks:**
- Welcome guests
- Monitor timeline and pacing
- Address any issues quickly
- Ensure team has what they need
- Make real-time adjustments

### Post-Event "Hot Wash" Debrief

Immediately after the event (within 30 minutes), conduct a quick debrief:

**Questions to Answer:**
- What went well?
- What didn't go as planned?
- What surprised you?
- What would you do differently?
- What did you learn?

**Capture While Fresh:**
- Take notes immediately
- Get team feedback
- Document issues and solutions
- Note successes to repeat
- Identify improvements

### Post-Event Report

Your formal report (due in 3 days) should include:

**1. Executive Summary**
- Event overview
- Overall success assessment
- Key metrics

**2. What Went Well**
- Successful elements
- Positive feedback
- Achievements

**3. Challenges & Solutions**
- Problems encountered
- How you handled them
- Lessons learned

**4. Metrics & Data**
- Attendance numbers
- Budget actuals vs. planned
- Feedback scores
- Other measurable outcomes

**5. Recommendations**
- What to repeat
- What to improve
- What to change
- Future considerations

**6. Personal Reflection**
- What you learned
- Skills developed
- Confidence gained
- Next steps`,
          keyConcepts: [
            'Event Execution',
            'On-site Management',
            'Real-time Problem Solving',
            'Post-Event Analysis',
            'Lessons Learned'
          ],
          videos: [
            {
              topic: 'Event Day Execution',
              youtubeId: '',
              description: 'Managing on-site operations and real-time challenges'
            },
            {
              topic: 'Post-Event Debriefing',
              youtubeId: '',
              description: 'How to conduct effective post-event analysis and learning'
            }
          ],
          notes: 'Congratulations on reaching event day! Trust your preparation, stay flexible, and remember to enjoy the experience. The debrief is crucial for learning.',
          completed: false,
        },
      ],
      completed: false,
    },
  ]);

  // Load progress from database
  const loadProgress = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('elearning_progress')
        .select('lesson_id, completed, viewed')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading progress:', error);
        // If table doesn't exist, return empty map (progress will start fresh)
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('Elearning progress table does not exist. Please run the SQL script to create it.');
          return { progressMap: {}, viewedSet: new Set<string>() };
        }
        return { progressMap: {}, viewedSet: new Set<string>() };
      }

      // Create a map of lesson_id -> completed status
      const progressMap: Record<string, boolean> = {};
      const viewedSet = new Set<string>();
      
      if (data) {
        data.forEach((item) => {
          progressMap[item.lesson_id] = item.completed || false;
          if (item.viewed) {
            viewedSet.add(item.lesson_id);
          }
        });
      }

      return { progressMap, viewedSet };
    } catch (error) {
      console.error('Error loading progress:', error);
      return { progressMap: {}, viewedSet: new Set<string>() };
    }
  };

  // Save progress to database
  const saveProgress = async (userId: string, lessonId: string, weekNumber: number, completed: boolean, viewed?: boolean) => {
    try {
      const updateData: any = {
        user_id: userId,
        lesson_id: lessonId,
        week_number: weekNumber,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      // If viewed is provided, update it
      if (viewed !== undefined) {
        updateData.viewed = viewed;
        updateData.viewed_at = viewed ? new Date().toISOString() : null;
      }

      const { data, error } = await supabase
        .from('elearning_progress')
        .upsert(updateData, {
          onConflict: 'user_id,lesson_id'
        })
        .select();

      if (error) {
        console.error('Error saving progress:', error);
        // Check if table doesn't exist
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          throw new Error('Database table not found. Please run the SQL script to create the elearning_progress table.');
        }
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate('/elearning/login');
          return;
        }

        setUserEmail(session.user.email || null);
        setUserId(session.user.id);
        const access = await isElearningUser();
        
        if (!access) {
          navigate('/elearning/login');
          return;
        }

        setHasAccess(true);

        // Load progress from database
        const { progressMap, viewedSet } = await loadProgress(session.user.id);
        
        // Set viewed lessons
        setViewedLessons(viewedSet);
        
        // Update weeks with completion status from database
        setWeeks(prevWeeks => 
          prevWeeks.map(week => ({
            ...week,
            lessons: week.lessons.map(lesson => ({
              ...lesson,
              completed: progressMap[lesson.id] || false,
            })),
          }))
        );
      } catch (error) {
        console.error('Error checking access:', error);
        navigate('/elearning/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/elearning/login');
  };

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleLesson = async (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    const wasExpanded = newExpanded.has(lessonId);
    
    if (wasExpanded) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
      
      // Mark lesson as viewed when expanded for the first time
      if (!viewedLessons.has(lessonId) && userId) {
        const newViewed = new Set(viewedLessons);
        newViewed.add(lessonId);
        setViewedLessons(newViewed);
        
        // Save viewed status to database
        try {
          // Find the lesson to get week number
          for (const week of weeks) {
            const lesson = week.lessons.find(l => l.id === lessonId);
            if (lesson) {
              await saveProgress(userId, lessonId, week.weekNumber, lesson.completed, true);
              break;
            }
          }
        } catch (error) {
          console.error('Error saving viewed status:', error);
          // Don't show error to user, just log it
        }
      }
    }
    setExpandedLessons(newExpanded);
  };

  const toggleLessonCompletion = async (weekNumber: number, lessonId: string) => {
    if (!userId) {
      console.error('User ID not available');
      return;
    }

    // Find the current lesson to get its completion status
    const week = weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;

    const lesson = week.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const newCompletedStatus = !lesson.completed;

    // Optimistically update UI
    setWeeks(prevWeeks =>
      prevWeeks.map(w =>
        w.weekNumber === weekNumber
          ? {
              ...w,
              lessons: w.lessons.map(l =>
                l.id === lessonId ? { ...l, completed: newCompletedStatus } : l
              ),
            }
          : w
      )
    );

    // Save to database
    try {
      await saveProgress(userId, lessonId, weekNumber, newCompletedStatus);
    } catch (error) {
      console.error('Error saving progress:', error);
      // Revert on error
      setWeeks(prevWeeks =>
        prevWeeks.map(w =>
          w.weekNumber === weekNumber
            ? {
                ...w,
                lessons: w.lessons.map(l =>
                  l.id === lessonId ? { ...l, completed: !newCompletedStatus } : l
                ),
              }
            : w
        )
      );
      // Silently fail - progress will be saved on next attempt
    }
  };

  const getSelectedLessonData = () => {
    if (!selectedLesson) return null;
    for (const week of weeks) {
      const lesson = week.lessons.find(l => l.id === selectedLesson);
      if (lesson) return { week, lesson };
    }
    return null;
  };

  const selectedLessonData = getSelectedLessonData();

  // Calculate progress
  const totalLessons = weeks.reduce((sum, week) => sum + week.lessons.length, 0);
  const completedLessons = weeks.reduce(
    (sum, week) => sum + week.lessons.filter(l => l.completed).length,
    0
  );
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading e-learning portal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        {/* Enhanced Header - Account for fixed nav - YENEGE Branding */}
        <div className="text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl flex-shrink-0">
                    <FaGraduationCap className="text-2xl sm:text-3xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs font-semibold whitespace-nowrap">INTERNSHIP PROGRAM</span>
                      <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs font-semibold flex items-center space-x-1 whitespace-nowrap">
                        <FaStar className="text-yellow-200" />
                        <span>4.8</span>
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">Event Organizing Internship</h1>
                    <p className="text-white/90 text-sm sm:text-base md:text-lg">Master the art of event planning through hands-on experience</p>
                  </div>
                </div>
                
                {/* Course Stats - Responsive Grid - YENEGE Branding */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaClock className="text-white/80 text-sm md:text-base" />
                      <span className="text-xs md:text-sm text-white/90">Duration</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">4 Weeks</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaBook className="text-white/80 text-sm md:text-base" />
                      <span className="text-xs md:text-sm text-white/90">Lessons</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">{totalLessons} Lessons</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaUsers className="text-white/80 text-sm md:text-base" />
                      <span className="text-xs md:text-sm text-white/90">Level</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">Beginner</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaLanguage className="text-white/80 text-sm md:text-base" />
                      <span className="text-xs md:text-sm text-white/90">Language</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">English</p>
                  </div>
                </div>
              </div>
              
              {/* User Info & Logout - Mobile Responsive */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-3 md:space-y-3 md:gap-0">
                {userEmail && (
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg flex-1 md:flex-none min-w-0">
                    <FaUser className="flex-shrink-0" />
                    <span className="text-xs md:text-sm truncate">{userEmail}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors flex-shrink-0 whitespace-nowrap"
                >
                  <FaSignOutAlt />
                  <span className="text-xs md:text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Enhanced Progress Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Your Learning Progress</h2>
                <p className="text-sm md:text-base text-gray-600">Track your journey through the course</p>
              </div>
              {progress === 100 && (
                <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 md:px-4 py-2 rounded-lg">
                  <FaCertificate className="text-lg md:text-xl" />
                  <span className="font-semibold text-sm md:text-base">Certificate Ready!</span>
              </div>
              )}
              </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-bold text-gray-900">{completedLessons} of {totalLessons} lessons</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)'
                    }}
                  >
                    <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #FF6F5E 0%, #C73A26 100%)' }}>
                    <FaBook className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalLessons - completedLessons}</p>
                    <p className="text-sm text-gray-600">Remaining</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Overview Cards - YENEGE Branding */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="p-2 md:p-3 rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
                  <FaClock className="text-white text-lg md:text-xl" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Time Commitment</h3>
                  <p className="text-xs md:text-sm text-gray-600">3-4 hours per day</p>
                </div>
              </div>
              <p className="text-gray-700 text-xs md:text-sm">Monday to Friday, 9:00 AM - 12:30 PM</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 md:p-3 rounded-lg flex-shrink-0 border border-blue-100">
                  <FaBook className="text-indigo-600 text-lg md:text-xl" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Learning Format</h3>
                  <p className="text-xs md:text-sm text-gray-600">Interactive & Practical</p>
                </div>
              </div>
              <p className="text-gray-700 text-xs md:text-sm">Guided lessons, workshops, and mentorship</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-2 md:p-3 rounded-lg flex-shrink-0 border border-amber-100">
                  <FaAward className="text-orange-600 text-lg md:text-xl" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Certificate</h3>
                  <p className="text-xs md:text-sm text-gray-600">Upon completion</p>
                </div>
              </div>
              <p className="text-gray-700 text-xs md:text-sm">Earn a certificate after finishing all modules</p>
            </div>
          </div>

          {/* Course Philosophy - YENEGE Branding */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl p-4 md:p-8 border border-amber-200 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Course Philosophy</h2>
            <p className="text-xl md:text-2xl text-gray-800 mb-3 md:mb-4 font-semibold italic">"Learn, Do, Review."</p>
            <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6 leading-relaxed">
              Each week combines foundational knowledge with practical application. We believe in learning by doing, 
              ensuring that every concept is immediately applied to real-world scenarios.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-base md:text-lg">Learn</h3>
                <p className="text-sm md:text-base text-gray-600">Comprehensive lessons covering all aspects of event planning</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-base md:text-lg">Do</h3>
                <p className="text-sm md:text-base text-gray-600">Hands-on workshops and real-world project assignments</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-base md:text-lg">Review</h3>
                <p className="text-sm md:text-base text-gray-600">Regular feedback sessions and mentorship to refine your skills</p>
              </div>
            </div>
          </div>

          {/* Course Weeks - Coursera Style */}
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Course Content</h2>
              <div className="text-xs md:text-sm text-gray-600">
                {weeks.length} modules • {totalLessons} lessons
              </div>
            </div>
            {weeks.map((week) => {
              const weekCompleted = week.lessons.filter(l => l.completed).length;
              const weekProgress = week.lessons.length > 0 ? (weekCompleted / week.lessons.length) * 100 : 0;
              const isExpanded = expandedWeeks.has(week.weekNumber);

              return (
                <div key={week.weekNumber} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  {/* Week Header */}
                  <div
                    className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                    onClick={() => toggleWeek(week.weekNumber)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-bold text-base md:text-lg" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
                          {week.weekNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">
                              {week.theme}
                            </h3>
                            {week.completed && (
                              <FaCheckCircle className="text-green-500 text-lg md:text-xl flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-gray-600 mb-2 md:mb-3 text-xs md:text-sm leading-relaxed">{week.goal}</p>
                          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                            <span className="flex items-center space-x-1 md:space-x-2">
                              <FaBook className="text-blue-500 flex-shrink-0" />
                              <span className="font-medium">{week.lessons.length} lessons</span>
                            </span>
                            <span className="flex items-center space-x-1 md:space-x-2">
                              <FaClock className="text-indigo-500 flex-shrink-0" />
                              <span className="font-medium">{week.lessons.reduce((sum, l) => {
                                const time = parseFloat(l.time) || 0;
                                return sum + time;
                              }, 0).toFixed(1)} hours</span>
                            </span>
                            <span className="flex items-center space-x-1 md:space-x-2">
                              <FaCheckCircle className={`flex-shrink-0 ${weekCompleted === week.lessons.length ? "text-green-500" : "text-gray-400"}`} />
                              <span className="font-medium">{weekCompleted}/{week.lessons.length} completed</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
                            <div
                              className="h-2 md:h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-1 md:pr-2"
                              style={{ 
                                width: `${weekProgress}%`,
                                background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)'
                              }}
                            >
                              {weekProgress > 15 && (
                                <span className="text-xs font-bold text-white">{Math.round(weekProgress)}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {isExpanded ? (
                            <FaChevronDown className="text-gray-400 text-lg md:text-xl" />
                          ) : (
                            <FaChevronRight className="text-gray-400 text-lg md:text-xl" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Week Lessons - Coursera Style */}
                  {isExpanded && (
                    <div className="bg-gray-50">
                      {week.lessons.map((lesson, lessonIndex) => {
                        const isLessonExpanded = expandedLessons.has(lesson.id);
                        return (
                          <div key={lesson.id} className="border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
                            <div
                              className="p-3 md:p-5 cursor-pointer"
                              onClick={() => {
                                toggleLesson(lesson.id);
                                setSelectedLesson(lesson.id);
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                                      lesson.completed 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {lesson.completed ? <FaCheckCircle className="text-xs md:text-sm" /> : lessonIndex + 1}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">{lesson.date}</span>
                                      <span className="flex items-center space-x-1 text-xs text-gray-500">
                                        <FaClock className="text-indigo-500 flex-shrink-0" />
                                        <span className="font-medium">{lesson.time}</span>
                                      </span>
                                      {lesson.videos && lesson.videos.length > 0 && (
                                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                                          <FaVideo className="text-red-500 flex-shrink-0" />
                                          <span className="font-medium">{lesson.videos.length} video{lesson.videos.length > 1 ? 's' : ''}</span>
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 hover:text-blue-600 transition-colors leading-tight">{lesson.topic}</h4>
                                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{lesson.activity}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                                  {/* Only show Mark Complete button if lesson has been viewed or is already completed */}
                                  {(viewedLessons.has(lesson.id) || lesson.completed) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLessonCompletion(week.weekNumber, lesson.id);
                                      }}
                                      className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                                        lesson.completed
                                          ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                      }`}
                                    >
                                      {lesson.completed ? (
                                        <span className="flex items-center space-x-1 md:space-x-2">
                                          <FaCheckCircle className="text-xs" />
                                          <span className="hidden sm:inline">Done</span>
                                        </span>
                                      ) : (
                                        <span className="flex items-center space-x-1 md:space-x-2">
                                          <FaCheckCircle className="text-xs" />
                                          <span className="hidden sm:inline">Mark Complete</span>
                                        </span>
                                      )}
                                    </button>
                                  )}
                                  {!viewedLessons.has(lesson.id) && !lesson.completed && (
                                    <span className="px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 whitespace-nowrap">
                                      <span className="hidden sm:inline">View Lesson</span>
                                      <span className="sm:hidden">View</span>
                                    </span>
                                  )}
                                  <div className="text-gray-400 flex-shrink-0">
                                    {isLessonExpanded ? (
                                      <FaChevronDown className="text-sm md:text-base" />
                                    ) : (
                                      <FaChevronRight className="text-sm md:text-base" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Lesson Details - Enhanced */}
                            {isLessonExpanded && (
                              <div className="px-3 md:px-5 pb-4 md:pb-6 pl-12 md:pl-20 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
                                <div className="space-y-4 md:space-y-6 pt-4 md:pt-6">
                                  {/* Activity & Deliverables - YENEGE Branding */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                      <h5 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                                        <FaPlayCircle className="text-indigo-600" />
                                        <span>Activity</span>
                                      </h5>
                                      <p className="text-gray-700 text-sm leading-relaxed">{lesson.activity}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                                      <h5 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                                        <FaFileAlt className="text-orange-600" />
                                        <span>Deliverables</span>
                                      </h5>
                                      <p className="text-gray-700 text-sm leading-relaxed">{lesson.deliverables}</p>
                                    </div>
                                  </div>

                                  {/* Lesson Content - Enhanced - YENEGE Branding */}
                                  {lesson.content && (
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                      <div className="flex items-center space-x-3 mb-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-100">
                                          <FaBook className="text-indigo-600" />
                                        </div>
                                        <h5 className="font-bold text-gray-900 text-lg">Lesson Content</h5>
                                      </div>
                                      <div 
                                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ 
                                          __html: lesson.content
                                            .split('\n')
                                            .map(line => {
                                              // Convert markdown-style headers
                                              if (line.startsWith('### ')) {
                                                return `<h3 class="text-lg font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">${line.substring(4)}</h3>`;
                                              }
                                              if (line.startsWith('## ')) {
                                                return `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-indigo-200">${line.substring(3)}</h2>`;
                                              }
                                              if (line.startsWith('# ')) {
                                                return `<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${line.substring(2)}</h1>`;
                                              }
                                              // Convert bold
                                              line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
                                              // Convert numbered lists
                                              if (/^\d+\.\s/.test(line)) {
                                                return `<li class="ml-6 mb-2">${line.replace(/^\d+\.\s/, '')}</li>`;
                                              }
                                              // Convert bullet points
                                              if (line.startsWith('- ')) {
                                                return `<li class="ml-6 mb-2 list-disc">${line.substring(2)}</li>`;
                                              }
                                              // Regular paragraphs
                                              if (line.trim()) {
                                                return `<p class="mb-4 text-gray-700 leading-relaxed">${line}</p>`;
                                              }
                                              return line;
                                            })
                                            .join('\n')
                                            .replace(/(<li.*?<\/li>)/g, '<ul class="list-disc space-y-2 mb-4 text-gray-700">$1</ul>')
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Key Concepts - Enhanced - YENEGE Branding */}
                                  {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                      <h5 className="font-bold text-gray-900 mb-4 flex items-center space-x-2 text-lg">
                                        <FaAward className="text-indigo-600" />
                                        <span>Key Concepts</span>
                                      </h5>
                                      <div className="flex flex-wrap gap-3">
                                        {lesson.keyConcepts.map((concept, idx) => (
                                          <span
                                            key={idx}
                                            className="px-4 py-2 bg-white text-indigo-700 rounded-lg text-sm font-semibold shadow-sm border border-indigo-200 hover:shadow-md transition-shadow"
                                          >
                                            {concept}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {lesson.videos && lesson.videos.length > 0 && (
                                    <div className="mt-6">
                                      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
                                        <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg">
                                          <FaYoutube className="text-red-600 text-xl" />
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-gray-900 text-lg">Video Lessons</h5>
                                          <p className="text-xs text-gray-500">Watch and learn from expert instructors</p>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 gap-6">
                                        {lesson.videos.map((video, idx) => (
                                          <div 
                                            key={idx} 
                                            className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                          >
                                            <div className="p-5">
                                              <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                  <div className="flex items-center space-x-2 mb-2">
                                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                                                      {idx + 1}
                                                    </span>
                                                    <h6 className="font-bold text-gray-900 text-base leading-tight">{video.topic}</h6>
                                                  </div>
                                                  {video.description && (
                                                    <p className="text-sm text-gray-600 ml-8 leading-relaxed">{video.description}</p>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {video.youtubeId ? (
                                                <div className="mt-4 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
                                                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                                    <iframe
                                                      className="absolute top-0 left-0 w-full h-full"
                                                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                                      title={video.topic}
                                                      frameBorder="0"
                                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                      allowFullScreen
                                                    />
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="mt-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                                                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                                                    <FaVideo className="text-yellow-600 text-2xl" />
                                                  </div>
                                                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                                                    Video Coming Soon
                                                  </p>
                                                  <p className="text-xs text-yellow-700 mb-2">
                                                    Topic: <span className="font-medium">{video.topic}</span>
                                                  </p>
                                                  <p className="text-xs text-yellow-600">
                                                    This video will be available soon
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Important Notes */}
                                  {lesson.notes && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-5 shadow-sm">
                                      <h5 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                                        <span className="text-xl">💡</span>
                                        <span>Important Notes</span>
                                      </h5>
                                      <p className="text-gray-700 leading-relaxed">{lesson.notes}</p>
                                    </div>
                                  )}

                                  {/* Mark Complete Button at End of Lesson */}
                                  {(viewedLessons.has(lesson.id) || lesson.completed) && (
                                    <div className="pt-4 border-t border-gray-200">
                                      <button
                                        onClick={() => {
                                          toggleLessonCompletion(week.weekNumber, lesson.id);
                                        }}
                                        className={`w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-base font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                                          lesson.completed
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                                        }`}
                                      >
                                        {lesson.completed ? (
                                          <>
                                            <FaCheckCircle className="text-lg" />
                                            <span>Lesson Completed ✓</span>
                                          </>
                                        ) : (
                                          <>
                                            <FaCheckCircle className="text-lg" />
                                            <span>Mark Lesson as Complete</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Certificate Section */}
          {progress === 100 && (
            <div className="mt-6 md:mt-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl shadow-lg p-4 md:p-8 border-2 border-green-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-start md:items-center space-x-3 md:space-x-4 flex-1">
                  <div className="bg-green-500 p-3 md:p-4 rounded-xl flex-shrink-0">
                    <FaCertificate className="text-white text-2xl md:text-4xl" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Congratulations! 🎉</h2>
                    <p className="text-base md:text-lg text-gray-700 mb-1">You've completed the Event Organizing Internship course!</p>
                    <p className="text-xs md:text-sm text-gray-600">Your certificate is ready for download.</p>
                  </div>
                </div>
                <button className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <FaDownload />
                  <span className="text-sm md:text-base">Download Certificate</span>
                </button>
              </div>
            </div>
          )}

          {/* Calendar Overview - Enhanced */}
          <div className="mt-6 md:mt-8 bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Course Schedule Overview</h2>
              <div className="text-xs md:text-sm text-gray-600 flex items-center space-x-2">
                <FaCalendarAlt className="text-orange-500" />
                <span>{weeks.length} weeks • {totalLessons} lessons</span>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider">Week</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider hidden sm:table-cell">Theme</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider hidden md:table-cell">Key Focus</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider">Lessons</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weeks.map((week) => {
                      const weekCompleted = week.lessons.filter(l => l.completed).length;
                      const isWeekComplete = weekCompleted === week.lessons.length;
                      return (
                        <tr key={week.weekNumber} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
                              {week.weekNumber}
                            </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 text-xs md:text-sm">Week {week.weekNumber}</span>
                                <span className="text-xs text-gray-500 sm:hidden">{week.theme}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-3 md:py-4 font-medium text-gray-900 text-xs md:text-sm hidden sm:table-cell">{week.theme}</td>
                          <td className="px-3 md:px-4 py-3 md:py-4 text-gray-700 text-xs md:text-sm hidden md:table-cell">{week.goal}</td>
                          <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                            <span className="text-gray-600 font-medium text-xs md:text-sm">{week.lessons.length} lessons</span>
                          </td>
                          <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                            {isWeekComplete ? (
                              <span className="inline-flex items-center space-x-1 px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-semibold">
                                <FaCheckCircle className="text-xs" />
                                <span>Complete</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 md:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs md:text-sm font-semibold">
                                <span>In Progress</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Elearning;
