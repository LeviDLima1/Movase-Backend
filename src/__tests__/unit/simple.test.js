/**
 * SIMPLE TEST - Teste Simples
 * 
 * Teste básico para verificar se o Jest está funcionando
 */

describe('Simple Test', () => {
  test('deve somar dois números corretamente', () => {
    expect(2 + 2).toBe(4);
  });

  test('deve verificar se string contém substring', () => {
    expect('Hello World').toContain('World');
  });

  test('deve verificar se objeto tem propriedade', () => {
    const obj = { name: 'Test', age: 25 };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('Test');
  });
});
