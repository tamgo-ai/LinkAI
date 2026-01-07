import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import CreatePostView from './components/CreatePostView';
import ScheduleView from './components/ScheduleView';
import SettingsView from './components/SettingsView';
import OnboardingView from './components/OnboardingView';
import { ViewState, Post, UserProfile, ContentFormat, PostTone } from './types';

// Mock data for existing posts
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    topic: 'AI in 2024',
    content: {
      headline: 'The Future of AI is Agentic',
      body: 'We are moving from chatbots to agents that do work. Are you ready?',
      hashtags: ['#AI', '#Tech', '#Future'],
      cta: 'What do you think?'
    },
    imageUrl: 'https://picsum.photos/id/4/800/450',
    format: ContentFormat.CINEMATIC_PHOTO,
    scheduledDate: new Date('2023-10-25'),
    status: 'published',
    stats: { views: 12050, likes: 450, comments: 89 }
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  
  // User Profile State (Initially null to trigger Onboarding)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleSchedulePost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    if (newPost.status === 'published') {
       setCurrentView(ViewState.SCHEDULE);
    } else {
       setCurrentView(ViewState.SCHEDULE);
    }
  };

  const handleConnectLinkedIn = () => {
    setIsLinkedInConnected(true);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    // Go straight to creation to try it out
    setCurrentView(ViewState.CREATE);
  };

  // Force Onboarding if no profile
  if (!userProfile) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <DashboardView />;
      case ViewState.CREATE:
        return (
          <CreatePostView 
            onSchedule={handleSchedulePost} 
            isLinkedInConnected={isLinkedInConnected}
            userProfile={userProfile}
          />
        );
      case ViewState.SCHEDULE:
        return <ScheduleView posts={posts} />;
      case ViewState.SETTINGS:
        return (
          <SettingsView 
            isConnected={isLinkedInConnected} 
            onConnect={handleConnectLinkedIn} 
          />
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} userProfile={userProfile}>
      {renderView()}
    </Layout>
  );
};

export default App;