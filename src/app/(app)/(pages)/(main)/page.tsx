import Link from "next/link";


export default async function Home() {
  return (
    <div>
      <h1>Welcome to my blog</h1>
      <Link href="/new-post">
        Create a new post
      </Link>
    </div>
  )
}
