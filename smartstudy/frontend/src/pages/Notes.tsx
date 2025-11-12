import { useState } from 'react'

export default function Notes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const notes = [
    {
      id: 1,
      title: 'Photosynthesis Process',
      content: 'Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen...',
      category: 'Biology',
      date: '2025-01-20',
      tags: ['plants', 'energy', 'cellular-process']
    },
    {
      id: 2,
      title: 'Quadratic Equations',
      content: 'A quadratic equation is a polynomial equation of degree 2. The general form is ax² + bx + c = 0...',
      category: 'Mathematics',
      date: '2025-01-19',
      tags: ['algebra', 'equations', 'polynomials']
    },
    {
      id: 3,
      title: 'World War II Timeline',
      content: 'World War II was a global conflict that lasted from 1939 to 1945. Key events include...',
      category: 'History',
      date: '2025-01-18',
      tags: ['war', 'timeline', '20th-century']
    },
    {
      id: 4,
      title: 'Chemical Bonding',
      content: 'Chemical bonds are forces that hold atoms together in molecules and compounds...',
      category: 'Chemistry',
      date: '2025-01-17',
      tags: ['atoms', 'molecules', 'bonds']
    }
  ]

  const categories = ['All', 'Biology', 'Mathematics', 'History', 'Chemistry']

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      'Biology': 'bg-green-100 text-green-800',
      'Mathematics': 'bg-blue-100 text-blue-800',
      'History': 'bg-purple-100 text-purple-800',
      'Chemistry': 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl mb-6 shadow-2xl">
          <span className="text-4xl">📝</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Smart Notes</h1>
        <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Organize and search through your study notes with intelligent categorization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            <button className="w-full mb-8 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg text-lg font-medium">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Note</span>
            </button>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-200 text-lg ${
                      selectedCategory === category
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                    {category !== 'All' && (
                      <span className="float-right text-sm text-gray-400">
                        {notes.filter(note => note.category === category).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Tags</h3>
              <div className="flex flex-wrap gap-3">
                {['plants', 'algebra', 'timeline', 'atoms', 'energy'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="mb-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search notes, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl leading-5 bg-white/90 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg shadow-lg"
              />
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">{note.title}</h3>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-600 text-lg mb-6 line-clamp-3 leading-relaxed">{note.content}</p>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(note.category)}`}>
                      {note.category}
                    </span>
                    <span className="text-sm text-gray-500">{note.date}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">No notes found</h3>
              <p className="text-xl text-gray-600">Try adjusting your search or create a new note.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}