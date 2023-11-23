'use client'

import { useState } from 'react'

type Users = {
    name: string
    email: string
}

export default function Home() {
    const [csvFile, setCsvFile] = useState<File | null>(null)

    const [results, setResults] = useState<Users[]>([])

    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 20,
        total: 0,
    })

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = event.target.files?.[0]
        setCsvFile(file || null)
    }

    const processCsv = () => {
        if (csvFile) {
            const reader = new FileReader()
            reader.onload = () => {
                const text = reader.result
                console.log(text)

                const users = text
                    ?.toString()
                    .split('\n')
                    .filter((_, i) => i !== 0)
                    .map(line => {
                        // TODO: can generalize this further to include more fields
                        const [name, email] = line.split(',')
                        return { name, email: email.trim() }
                    })
                console.log(users)
                setResults(users || []) // Add a default value of an empty array if `users` is undefined
                setPagination(prev => ({ ...prev, total: users?.length || 0 }))
            }
            reader.readAsText(csvFile)
        }
    }

    const paginatedResults = results.reduce((acc, user, index) => {
        const pageIndex = Math.floor(index / pagination.perPage)
        if (!acc[pageIndex]) {
            acc[pageIndex] = []
        }
        acc[pageIndex].push(user)
        return acc
    }, [] as Users[][])

    return (
        <main className='flex min-h-screen flex-col items-center py-10 bg-gray-400'>
            <h2 className='text-3xl mb-5'>Read csv</h2>

            <div className='flex mb-auto gap-20'>
                <input type='file' accept='.csv' onChange={handleFileChange} />

                <button className='bg-blue-500 hover:bg-blue-700 text-white px-4 rounded' onClick={processCsv}>
                    Submit
                </button>
            </div>

            <div>
                <div className='flex items-center justify-between w-full gap-20 mt-4 mb-2'>
                    <h3>
                        Results
                        <span className='text-sm font-light'>
                            {pagination.total > 0 &&
                                ` (${pagination.page} of ${Math.ceil(pagination.total / pagination.perPage)})`}
                        </span>
                    </h3>
                    <div className='flex justify-center gap-x-2'>
                        <button
                            className='bg-purple-500 hover:bg-purple-700 text-white py-0 px-4 rounded disabled:opacity-50'
                            disabled={pagination.page === 1}
                            onClick={() =>
                                pagination.page > 1 && setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                            }>
                            Previous
                        </button>
                        <button
                            className='bg-purple-500 hover:bg-purple-700 text-white py-0 px-4 rounded disabled:opacity-50'
                            disabled={pagination.page === Math.ceil(pagination.total / pagination.perPage)}
                            onClick={() =>
                                pagination.page < Math.ceil(pagination.total / pagination.perPage) &&
                                setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                            }>
                            Next
                        </button>
                    </div>
                </div>
                <ul className='flex flex-col gap-2'>
                    {paginatedResults[pagination.page - 1]?.map((user, index) => (
                        <li
                            key={(pagination.page - 1) * pagination.perPage + index}
                            className='flex gap-2 items-center justify-center'>
                            <p>{(pagination.page - 1) * pagination.perPage + index + 1}. </p>
                            <input
                                type='text'
                                name='name'
                                className='bg-gray-100 p-1 rounded'
                                value={user.name}
                                onChange={e => {
                                    const { value } = e.target
                                    setResults(prev => {
                                        const newResults = [...prev]
                                        newResults[(pagination.page - 1) * pagination.perPage + index].name = value
                                        return newResults
                                    })
                                }}
                            />

                            <input
                                type='text'
                                name='email'
                                className='bg-gray-100 p-1 rounded'
                                value={user.email}
                                onChange={e => {
                                    const { value } = e.target
                                    setResults(prev => {
                                        const newResults = [...prev]
                                        newResults[(pagination.page - 1) * pagination.perPage + index].email = value
                                        return newResults
                                    })
                                }}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    )
}
