import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

export const urls = {
    serverUrl: 'http://localhost:3001/graphql',
    // serverUrl: 'https://ql-movie-api.herokuapp.com/',
    imagesBaseUrl: 'https://image.tmdb.org/t/p/original'
};

// make the connection with the graphql API and use also the browser's cache for storing data that are already searched from the user
const client = new ApolloClient({
    uri: urls.serverUrl,
    cache: new InMemoryCache()
});

const queries = {
    searchMovie: title => `query {
        searchMovie(query:"${title}") {
            movies {
                id,
                original_title,
                release_date,
                poster_path,
                overview,
                vote_average,
                vote_count
            }
        }
    }`,
    getMovieDetail: id => `query {
        movieDetail(id:${id}) {
            movie {
              genres {
                name
              },
              credits {
                cast {
                  id
                }
              },
              production_companies {
                name
              },
              runtime
            }
          } 
    }`,
    getPersonDetail: id => `query {
        personDetail(id:${id}) {
            person {
                name
            }
        }   
    }`
};

export const service = {
    getMovieByTitle: async (title) => client.query({ query: gql`${queries.searchMovie(title)}` }).then(res => res?.data?.searchMovie?.movies),
    getMovieDetails: async (id) => {
        let movieDetail =  await client.query({ query: gql`${queries.getMovieDetail(id)}`}).then(res => res?.data?.movieDetail?.movie);

        // for retrieving the cast, make the appropriate request for the first 4 cast ids that were retrieved from the 'getMovieDetail' request
        const castIds = movieDetail?.credits?.cast.slice(0, 4);
        const cast = await Promise.all(castIds.map(async ({ id }) => client.query({ query: gql`${queries.getPersonDetail(id)}`}).then(res => res?.data?.personDetail?.person?.name)));

        return {
            cast,
            genres: movieDetail?.genres,
            runtime: movieDetail?.runtime,
            productionCompanies: movieDetail?.production_companies.slice(0, 2) // show only the 2 first production companies
        }
    }
};

export default service;