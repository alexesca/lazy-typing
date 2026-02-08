export const metadata = {
  title: 'Lazy Typing Dashboard',
  description: 'Track typing practice sessions, trends, and streaks.'
};

const styles = {
  background: 'radial-gradient(circle at 15% 20%, #f8f5d6 0%, #f0efe5 38%, #e5ecef 100%)',
  minHeight: '100vh',
  color: '#1f2937',
  fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={styles}>{children}</body>
    </html>
  );
}
