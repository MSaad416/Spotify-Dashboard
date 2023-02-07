import {useEffect, useState} from 'react';
import { accessToken, logout, getCurrentUserProfile } from './spotify';
import { catchErrors } from './utils';
import {
  BrowserRouter as Router,
  useLocation,
  Route,
  Routes
} from 'react-router-dom';
import logo from './logo.svg';
import styled from 'styled-components/macro';
import { GlobalStyle } from './styles';
import {Login, Profile, TopArtists, TopTracks, Playlists} from './pages';


const StyledLogoutButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0,0,0,.7);
  color: var(--white);
  font-size: var(--fz-sm);
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  z-index: 10;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
`;

// Scroll to top of page when changing routes
// https://reactrouter.com/web/guides/scroll-restoration/scroll-to-top
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);

  // useEffect hook
  useEffect(() => {
    setToken(accessToken);

    const fetchData = async () => {
      const { data } = await getCurrentUserProfile();
      setProfile(data);
    };

    catchErrors(fetchData());
  }, []);

  return (
    <div className="App">
      <GlobalStyle/>
      <header className="App-header">
        {!token ? (
          <Login />
        ) : (
          <Router>
            <ScrollToTop/>
            <StyledLogoutButton onClick={logout}>
              Logout
            </StyledLogoutButton>

            <Routes>
              <Route path='/top-artists' 
              element={
                <TopArtists/>
              }/>
              <Route path="/top-tracks" 
              element={
                <TopTracks/>
              }/>
              <Route path="/playlists/:id" element={
                <h1>Playlist</h1>
              }/>
              <Route path="/playlists" element={
                <Playlists />
              }/>
              <Route path='/' element={
                <Profile/>
              }/>

            </Routes>
          </Router>
        )}

      </header>
    </div>
  );
}

export default App;
