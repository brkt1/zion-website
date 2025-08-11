import { deleteGameType } from "@/actions/admin/game-types";
import Link from "next/link";

export default function GameTypesTable({ gameTypes }: { gameTypes: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cards
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {gameTypes.map((gameType) => (
            <tr key={gameType.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{gameType.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {gameType.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {gameType.card_count || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/admin/game-types/${gameType.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </Link>
                <form action={deleteGameType} className="inline">
                  <input type="hidden" name="id" value={gameType.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-900"
                    onClick={(e) => {
                      if (
                        !confirm(
                          "Are you sure you want to delete this game type?"
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
