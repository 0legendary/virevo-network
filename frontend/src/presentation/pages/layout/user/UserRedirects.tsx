import Dock from '@/blocks/Components/Dock/Dock'
import { FaHome, FaCog, FaUser, FaEnvelope, FaFile, FaChartBar } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';

function UserRedirects() {
  let navigate = useNavigate();
  const dockItems = [
    {
      icon: <FaHome />,
      label: 'Home',
      className: '',
      onClick: () => navigate('/'),
    },
    {
      icon: <FaCog />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      icon: <FaUser />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      icon: <FaEnvelope />,
      label: 'Messages',
      onClick: () => navigate('/messages'),
    },
    // {
    //   icon: <FaFile />,
    //   label: 'Documents',
    //   onClick: () => console.log('Documents clicked'),
    // },
    // {
    //   icon: <FaChartBar />,
    //   label: 'Analytics',
    //   onClick: () => console.log('Analytics clicked'),
    // },
  ];
  return (
    <div>
      <Dock items={dockItems} baseItemSize={60} panelHeight={80} />
    </div>
  )
}

export default UserRedirects
