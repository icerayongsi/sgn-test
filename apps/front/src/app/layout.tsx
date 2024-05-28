import './global.css';

export const metadata = {
  title: 'Population growth per country',
  description: 'SGN test',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
