# Axior Features & Roadmap Dashboard

A modern, real-time dashboard for tracking Axior platform feature development progress.

## 🌐 Live URLs

- **Production (AWS Lambda + SSR)**: https://axiorreporting.axior.dev
- **GitHub Pages (Static)**: https://amaraxior.github.io/axiorreportingdashboard/

## ✨ Features

- 📊 **Real-time Progress Tracking**: Track 11+ platform modules with completion percentages
- 🎨 **Axior Brand Design**: Full brand implementation with Polar Mint (#039D8B) colors
- 🌙 **Dark Mode**: Beautiful dark theme by default
- 🔐 **Clerk Authentication**: Secure sign-in with AWS Lambda SSR
- 📱 **Responsive**: Mobile, tablet, and desktop optimized
- 🎯 **Category Filters**: Filter by Generation, Context, Grading, etc.
- 🔄 **JSON-Powered**: Easy updates via `data/features-roadmap.json`
- ⚡ **Fast Deployment**: One-command deploy to AWS or GitHub Pages

## 🚀 Quick Deploy

### Deploy to AWS (Lambda + SSR + Auth)

```bash
.\deploy-aws.ps1              # Windows
./deploy-aws.sh               # macOS/Linux
```

### Update Content

```bash
.\deploy.ps1 "Update message"  # Windows
./deploy.sh "Update message"   # macOS/Linux
```

## 📝 Update Features

Edit `data/features-roadmap.json`:

```json
{
  "id": 12,
  "name": "Your New Feature",
  "category": "generation",
  "status": "in-progress",
  "completion": 30,
  "statusItems": [
    "What you're working on"
  ],
  "tags": ["tag1", "tag2"],
  "priority": "high",
  "icon": "Rocket"
}
```

Then deploy:
```bash
.\deploy.ps1 "Add new feature"
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, SSR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Auth**: Clerk
- **Deployment**: AWS Amplify (Lambda) + GitHub Pages
- **Icons**: Lucide React
- **Fonts**: Poppins (headings), Manrope (body)

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

Visit http://localhost:3000

## 🔐 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Full deployment instructions
- [Brand Guide](./BRAND_IMPLEMENTATION_SUMMARY.md) - Axior brand guidelines

## 🏗️ Project Structure

```
projectdashboard/
├── app/
│   ├── globals.css          # Axior brand theme
│   ├── layout.tsx           # Root layout with Clerk
│   └── page.tsx             # Main dashboard page
├── components/ui/
│   ├── feature-card.tsx     # Feature display card
│   └── progress-ring.tsx    # Progress indicator
├── data/
│   ├── features-roadmap.json  # Feature data
│   └── types.ts             # TypeScript types
├── public/
│   └── axiorlogo.svg        # Axior logo
├── deploy.ps1               # Windows deploy script
├── deploy.sh                # macOS/Linux deploy script
├── deploy-aws.ps1           # AWS Amplify deploy (Windows)
└── deploy-aws.sh            # AWS Amplify deploy (macOS/Linux)
```

## 🎨 Design System

### Colors

- **Primary**: #039D8B (Polar Mint Core)
- **Foreground**: #0A1A26 (Deep Cold Navy)
- **Background**: #050E14 (Deep Navy Black)

### Typography

- **Headings**: Poppins (400, 500, 600, 700)
- **Body**: Manrope (400, 500, 600, 700)

## 📊 Feature Categories

- **Generation**: Spec/system generation
- **Context**: Prompt and context engineering
- **Grading**: Enterprise readiness evaluation
- **Marketplace**: Axior marketplace
- **Infrastructure**: Core infrastructure
- **Routing**: Smart routing
- **Registry**: Component registry

## 🔄 CI/CD

### GitHub Actions

Automatic deployment on push to `main`:
- Builds Next.js app
- Deploys to GitHub Pages
- Takes ~1 minute

### AWS Amplify

Automatic deployment on push to `main`:
- Builds with SSR
- Deploys to Lambda
- Takes ~2-3 minutes

## 📈 Analytics

Feature completion stats are auto-calculated:
- Total features
- In progress count
- Completed count
- Average completion percentage

## 🤝 Contributing

1. Edit `data/features-roadmap.json`
2. Run `.\deploy.ps1 "Your changes"`
3. Changes go live in 1-3 minutes

## 📄 License

Proprietary - Axior Inc.

## 🆘 Support

For deployment or technical issues, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Built with ❤️ by the Axior team**
