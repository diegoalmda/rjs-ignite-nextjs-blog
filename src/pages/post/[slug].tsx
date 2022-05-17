import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import { 
  parseISO, 
  format, 
} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import {FiClock, FiCalendar, FiUser} from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  minutesToReadThePost: number;
}

export default function Post({ post, minutesToReadThePost }: PostProps) {
  return !post ? <p>Carregando...</p> : (
    <>
      <Head>
        <title>{post.data.title} | Spacetravelling</title>
      </Head>

      <section className={styles.header}>
        <img src={post.data.banner.url} alt="" />
      </section>
      <main className={commonStyles.content}>
        <article>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.details_container}>
            <div className={styles.details}>
              <FiCalendar />
              <span>{post.first_publication_date}</span>
            </div>
            <div className={styles.details}>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div className={styles.details}>
              <FiClock />
              <span>{minutesToReadThePost} min</span>
            </div>
          </div>
          <div className={styles.body_content}>
            {post.data.content.map(({ heading, body }) => {
              return (
                <div key={heading} className={styles.heading_content}>
                  <h3>{heading}</h3>
                  {
                    body.map(({ text }, index) => <p key={index}>{text}</p>)
                  }
                </div>
              )
            })}
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType("posts", {
    lang: 'pt-BR',
  });

  const slugs = posts.results.map(post => {
    return post.uid;
  })

  return {
    paths: [
      { params: { slug: slugs[0]} } // colocar slugs para gerar as páginas estáticas na build
    ], 
    fallback: true
  }

};

export const getStaticProps: GetStaticProps = async ({params }) => {
  const prismic = getPrismicClient({});

  const { slug } = params;

  
  const response = await prismic.getByUID('posts', String(slug), {})
  
  // console.log(JSON.stringify(response.data.content, null, 2))
  // console.log(response.data.content)

  const totalPostWords = response.data.content.reduce((acc, item) => {
    const heading = item.heading.trim().split(' ').length;
    const body = item.body.reduce((accumulator, { text }) => {
      return accumulator += text.trim().split(' ').length;
    }, 0)

    return acc += (heading + body);
  }, 0);

  const minutesToReadThePost = Math.ceil(totalPostWords / 200);

  const post = {
    first_publication_date: format(parseISO(response.first_publication_date), 
      "dd MMM yyyy", {
        locale: ptBR,
      }
    ).toString(),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  // console.log(post)

  return {
    props: {
      post,
      minutesToReadThePost
    },
    redirect: 60 * 30, // 30 minutos
  }

};
