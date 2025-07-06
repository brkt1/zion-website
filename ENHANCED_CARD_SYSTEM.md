# Enhanced Yenege Card System

## Overview

The Enhanced Yenege Card System is a comprehensive solution for managing game cards, route access control, winner verification, and reward distribution in the Yenege gaming platform. This system provides secure, QR code-based authentication and game access management.

## System Architecture

### Core Components

1. **Enhanced Card Generator** - Admin tool for creating game cards with route restrictions
2. **Enhanced QR Scanner** - Player-facing scanner for card authentication and game access
3. **Winner Card Generator** - Automatic winner card generation system
4. **Winner Card Scanner** - Cafe owner/admin tool for prize verification and distribution

### Database Schema

#### Enhanced Cards Table (`enhanced_cards`)
- `id` - Unique card identifier
- `card_number` - 13-digit unique card number
- `duration` - Game session duration in minutes
- `game_type_id` - Reference to game type
- `route_access` - Array of accessible game routes
- `used` - Card usage status
- `player_id` - Assigned player ID (when used)
- `used_at` - Timestamp when card was used
- `created_at` - Card creation timestamp

#### Winner Cards Table (`winner_cards`)
- `winner_card_id` - Unique winner card identifier
- `player_id` - Player identifier
- `player_name` - Player name
- `game_type` - Game type played
- `score` - Achieved score
- `prize` - Prize description
- `status` - Claim status (unclaimed/claimed)
- `session_id` - Game session reference

#### Reward Claims Table (`reward_claims`)
- Logging table for tracking prize distributions
- Links winner cards to claiming staff members

## Features

### 1. Enhanced Card Generation

**Location**: `/enhanced-card-generator`

**Features**:
- Admin-only access with authentication
- Bulk card generation (1-20 cards)
- Route access control per card
- Customizable game duration
- PDF export with QR codes
- Professional card design

**Usage**:
1. Admin logs in and navigates to card generator
2. Selects game type and duration
3. Chooses accessible routes for the cards
4. Generates cards in bulk
5. Downloads PDF for printing

### 2. Enhanced QR Scanner

**Location**: `/enhanced-scanner`

**Features**:
- Camera-based QR code scanning
- Route access validation
- Player ID generation
- Session management integration
- Manual entry fallback
- Real-time card verification

**Usage**:
1. Player scans their game card
2. System validates card and shows available routes
3. Player selects desired game
4. System starts game session and redirects

### 3. Winner Card System

**Features**:
- Automatic winner card generation after game completion
- QR code-based verification
- Prize tracking and management
- Claim status monitoring

**Winner Card Generation Process**:
1. Player completes a game
2. System generates winner data
3. Winner card is created with unique QR code
4. Card can be downloaded as PDF or image

### 4. Winner Verification Scanner

**Location**: `/winner-card-scanner`

**Features**:
- Cafe owner/admin tool
- Winner card verification
- Prize claim processing
- Audit trail maintenance

**Usage**:
1. Cafe owner scans winner card QR code
2. System verifies card authenticity
3. Displays winner details and prize information
4. Processes reward claim and updates status

## Security Features

### Route Access Control
- Cards contain specific route permissions
- Players can only access purchased/assigned routes
- Route validation happens at scan time

### Card Authentication
- 13-digit unique card numbers
- QR code verification
- Database validation
- One-time use enforcement

### Winner Verification
- Cryptographic verification codes
- Database cross-referencing
- Claim status tracking
- Staff audit trails

## QR Code Structure

### Game Cards
```json
{
  "cardNumber": "1234567890123",
  "gameTypeId": "uuid",
  "duration": 30,
  "routeAccess": ["trivia", "truth-dare"],
  "playerId": "ABC12345",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Winner Cards
```json
{
  "type": "winner_card",
  "winnerCardId": "WIN-1234567890-ABC123",
  "playerId": "ABC12345",
  "prize": "Free Coffee",
  "verificationCode": "WIN-1234567890-ABC123"
}
```

## API Integration

### Supabase Integration
- Real-time database operations
- Row Level Security (RLS) policies
- Authentication and authorization
- Automatic backups and scaling

### Authentication Roles
- **Admin**: Full system access, card generation
- **Cafe Owner**: Winner verification, prize distribution
- **Player**: Card scanning, game access

## Installation & Setup

### Prerequisites
- Node.js 18+
- Supabase account and project
- Camera-enabled device for scanning

### Database Setup
1. Run migration: `002_enhanced_card_system.sql`
2. Verify table creation and RLS policies
3. Insert sample game types

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Dependencies
```bash
npm install qrcode html2canvas jspdf html5-qrcode
```

## Usage Workflows

### Card Generation Workflow
1. Admin authentication
2. Game type selection
3. Route configuration
4. Bulk generation
5. PDF export
6. Physical printing/distribution

### Player Game Access Workflow
1. Card scanning
2. Route selection
3. Session initialization
4. Game play
5. Winner card generation (if applicable)

### Prize Distribution Workflow
1. Winner presents card
2. Staff scans winner card
3. System verifies authenticity
4. Prize distribution
5. Claim status update

## Troubleshooting

### Common Issues

**Camera Access Denied**
- Check browser permissions
- Ensure HTTPS connection
- Try different camera if multiple available

**Card Not Found**
- Verify card number format (13 digits)
- Check if card was already used
- Confirm database connectivity

**Route Access Denied**
- Verify card route permissions
- Check game type compatibility
- Ensure card hasn't expired

### Error Codes
- `CARD_NOT_FOUND`: Card doesn't exist in database
- `CARD_ALREADY_USED`: Card has been previously used
- `ROUTE_ACCESS_DENIED`: Card doesn't have permission for selected route
- `INVALID_WINNER_CARD`: Winner card verification failed

## Performance Considerations

### Optimization Features
- Lazy loading of components
- Efficient QR code generation
- Optimized database queries
- Indexed database fields

### Scalability
- Horizontal scaling via Supabase
- CDN integration for static assets
- Caching strategies for frequent queries

## Security Best Practices

### Data Protection
- Encrypted QR codes
- Secure database connections
- Input validation and sanitization
- XSS and CSRF protection

### Access Control
- Role-based permissions
- Session management
- Audit logging
- Rate limiting

## Future Enhancements

### Planned Features
- Mobile app integration
- Batch card validation
- Advanced analytics dashboard
- Multi-language support
- Offline mode capabilities

### Integration Possibilities
- Payment gateway integration
- Loyalty program connection
- Social media sharing
- Email notifications

## Support & Maintenance

### Monitoring
- Error tracking via Sentry
- Performance monitoring
- Database health checks
- User activity analytics

### Backup & Recovery
- Automated database backups
- Point-in-time recovery
- Disaster recovery procedures
- Data export capabilities

## License & Credits

This enhanced card system is part of the Yenege gaming platform and includes integrations with:
- Supabase for backend services
- QRCode.js for QR generation
- html2canvas for PDF creation
- html5-qrcode for scanning capabilities

---

For technical support or feature requests, please contact the development team.
