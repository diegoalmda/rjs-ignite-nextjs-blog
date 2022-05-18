import { AppProps } from 'next/app';
import Header from '../components/Header';
import '../styles/globals.scss';
import styles from '../styles/common.module.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <main className={styles.content}>
      <Header />
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;
