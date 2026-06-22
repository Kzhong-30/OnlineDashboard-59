import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import Home from '@/pages/Home';
import RecipeList from '@/pages/RecipeList';
import RecipeDetail from '@/pages/RecipeDetail';
import RecipePublish from '@/pages/RecipePublish';
import Calculator from '@/pages/Calculator';
import Timer from '@/pages/Timer';
import PostList from '@/pages/PostList';
import PostPublish from '@/pages/PostPublish';
import CourseList from '@/pages/CourseList';
import CourseDetail from '@/pages/CourseDetail';
import Shop from '@/pages/Shop';
import Profile from '@/pages/Profile';
import UserProfile from '@/pages/UserProfile';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/publish" element={<RecipePublish />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/posts/publish" element={<PostPublish />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </Router>
  );
}
