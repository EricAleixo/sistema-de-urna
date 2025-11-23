class DeleteCandidaturadFromTurma < ActiveRecord::Migration[7.2]
  def change
    add_foreign_key :candidaturas, :turmas, on_delete: :cascade
  end
end
