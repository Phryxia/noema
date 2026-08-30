import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { RecentLines } from '../../recent/RecentLines/RecentLines'
import { RECENT_DOCUMENTS_QUERY_KEY } from '../consts'
import { getRecentDocuments } from '../document.service'
import { DocumentTitleLabel } from '../DocumentTitleLabel/DocumentTitleLabel'

export function RecentDocuments(): ReactElement {
  const { data: recentDocuments } = useQuery({
    queryKey: [RECENT_DOCUMENTS_QUERY_KEY],
    queryFn: getRecentDocuments,
  })

  return (
    <RecentLines title={<Link to="/recent/documents">최근에 추가된 문서</Link>}>
      {recentDocuments?.map((document) => (
        <li key={document.documentId}>
          <Link to="/document/$documentId" params={{ documentId: String(document.documentId) }}>
            <DocumentTitleLabel title={document.title} />
          </Link>
        </li>
      ))}
    </RecentLines>
  )
}
