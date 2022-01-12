import { useState, useEffect } from 'react'
import './App.css'
import Image from './components/Image'

import { copy } from './helpers'

function App () {
  const [images, setImages] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('http://localhost:3000/images')
      .then(resp => resp.json())
      .then(imagesFromServer => setImages(imagesFromServer))
  }, [])

  function likeImage (image) {
    // update the server
    fetch(`http://localhost:3000/images/${image.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ likes: image.likes + 1 })
    })

    // update state
    const updatedImages = copy(images)
    const match = updatedImages.find(target => target.id === image.id)
    match.likes++
    setImages(updatedImages)
  }

  function createComment (content, imageId) {
    // create comment on server
    fetch('http://localhost:3000/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, imageId })
    })
      .then(resp => resp.json())
      .then(newComment => {
        // create a copy
        const imagesCopy = copy(images)

        //update the stuff we want
        const imageToChange = imagesCopy.find(image => image.id === imageId)
        imageToChange.comments.push(newComment)

        // update state
        setImages(imagesCopy)
      })
  }

  function deleteComment (comment) {
    // delete comment on server
    fetch(`http://localhost:3000/comments/${comment.id}`, {
      method: 'DELETE'
    })

    // create a copy of the data we want to change
    const imagesCopy = copy(images)

    // change the data
    const imageToChange = imagesCopy.find(image => image.id === comment.imageId)
    imageToChange.comments = imageToChange.comments.filter(
      targetComment => targetComment.id !== comment.id
    )

    // update state
    setImages(imagesCopy)
  }

  const searchedImages = images.filter(image =>
    image.title.toUpperCase().includes(search.toUpperCase())
  )

  return (
    <div className='App'>
      <img
        className='logo'
        src='assets/hoxtagram-logo.png'
        alt='hoxtogram logo'
      />

      <div>
        <h2>Search for images</h2>
        <input
          type='text'
          placeholder='enter your search here'
          onChange={e => {
            setSearch(e.target.value)
          }}
        />
      </div>

      <div>
        <h2>Add an image</h2>
        <form
          onSubmit={e => {
            e.preventDefault()
            console.log('title: ', e.target.title.value)
            console.log('url:', e.target.url.value)
            e.target.reset()
          }}
        >
          <input type='text' placeholder='title' name='title' />
          <input type='text' placeholder='url' name='url' />
          <button>ADD IMAGE</button>
        </form>
      </div>

      <section className='image-container'>
        {searchedImages.map(image => (
          <Image
            key={image.id}
            image={image}
            likeImage={likeImage}
            createComment={createComment}
            deleteComment={deleteComment}
          />
        ))}
      </section>
    </div>
  )
}

export default App
