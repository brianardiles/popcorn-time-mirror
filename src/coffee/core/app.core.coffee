'use strict'

angular.module 'com.module.core', []

  .constant 'sorters',
    movie: [
      'popularity'
      'trending'
      'last added'
      'year'
      'title'
      'rating'
      ]

    show: [
      'popularity'
      'trending'
      'updated'
      'year'
      'name'
      'rating'
      ]

    anime: [
      'popularity'
      'trending'
      'updated'
      'year'
      'name'
      'rating'
      ]
      
  .constant 'types',
    anime: [
      'All'
      'Movies'
      'TV'
      'OVA'
      'ONA'
    ]

  .constant 'genres', 
    movie: [
      'All'
      'Action'
      'Adventure'
      'Animation'
      'Biography'
      'Comedy'
      'Crime'
      'Documentary'
      'Drama'
      'Family'
      'Fantasy'
      'Film-Noir'
      'History'
      'Horror'
      'Music'
      'Musical'
      'Mystery'
      'Romance'
      'Sci-Fi'
      'Short'
      'Sport'
      'Thriller'
      'War'
      'Western'
      ]

    anime: [
      'All'
      'Action'
      'Adventure'
      'Cars'
      'Comedy'
      'Dementia'
      'Demons'
      'Drama'
      'Ecchi'
      'Fantasy'
      'Game'
      'Harem'
      'Historical'
      'Horror'
      'Josei'
      'Kids'
      'Magic'
      'Martial Arts'
      'Mecha'
      'Military'
      'Music'
      'Mystery'
      'Parody'
      'Police'
      'Psychological'
      'Romance'
      'Samurai'
      'School'
      'Sci-Fi'
      'Seinen'
      'Shoujo'
      'Shoujo Ai'
      'Shounen'
      'Shounen Ai'
      'Slice of Life'
      'Space'
      'Sports'
      'Super Power'
      'Supernatural'
      'Thriller'
      'Vampire'
      ]

    show: [
      'All'
      'Action'
      'Adventure'
      'Animation'
      'Children'
      'Comedy'
      'Crime'
      'Documentary'
      'Drama'
      'Family'
      'Fantasy'
      'Game Show'
      'Home and Garden'
      'Horror'
      'Mini Series'
      'Mystery'
      'News'
      'Reality'
      'Romance'
      'Science Fiction'
      'Soap'
      'Special Interest'
      'Sport'
      'Suspense'
      'Talk Show'
      'Thriller'
      'Western'
      ]