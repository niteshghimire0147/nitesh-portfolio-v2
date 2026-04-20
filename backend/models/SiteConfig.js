import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema(
  {
    about: {
      name:       String,
      location:   String,
      education:  String,
      focus:      String,
      goal:       String,
      phone:      String,
      status:     String,
      bio:        [String],
      highlights: [{ emoji: String, title: String, desc: String }],
    },
    skills: {
      categories: [{
        label: String,
        color: String,
        items: [{ name: String, pct: Number }],
      }],
      badges: [String],
    },
    experience: [{
      role:     String,
      company:  String,
      duration: String,
      location: String,
      type:     String,
      color:    String,
      tasks:    [String],
    }],
    certifications: {
      items: [{
        title:  String,
        issuer: String,
        color:  String,
        icon:   String,
        desc:   String,
        link:   String,
      }],
      achievement: {
        emoji: String,
        title: String,
        desc:  String,
      },
    },
    contact: {
      email:      String,
      phone:      String,
      location:   String,
      github:     String,
      linkedin:   String,
      hackthebox: String,
    },
    customNews: [{
      title:       String,
      description: String,
      source:      String,
      url:         String,
      publishedAt: { type: Date, default: Date.now },
    }],
    arsenal: [{
      emoji: String,
      label: String,
      color: String,
      tools: [{ name: String, desc: String, level: String }],
    }],
    hallOfFame: {
      cves: [{
        id:       String,
        severity: String,
        cvss:     String,
        title:    String,
        vendor:   String,
        desc:     String,
        link:     String,
      }],
      bugBounty: [{
        program:  String,
        company:  String,
        title:    String,
        severity: String,
        reward:   String,
        date:     String,
        status:   String,
      }],
      disclosures: [{
        title:  String,
        vendor: String,
        date:   String,
        status: String,
        desc:   String,
      }],
    },
  },
  { timestamps: true }
);

export default mongoose.model('SiteConfig', siteConfigSchema);
