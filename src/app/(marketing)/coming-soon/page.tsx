import { useNavigate } from 'react-router-dom';
import { ComingSoon } from '../../../components/sections/ComingSoon';

export function ComingSoonPage() {
  const navigate = useNavigate();

  return <ComingSoon onBackToLanding={() => navigate('/')} />;
}

